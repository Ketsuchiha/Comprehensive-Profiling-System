import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Plus, MapPin, Users, Clock, X, Edit } from "lucide-react";
import { api } from "../utils/api";

interface Event {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  attendees: number;
  type: "seminar" | "workshop" | "conference" | "meeting";
  status: "Upcoming" | "Ongoing" | "Completed" | "Cancelled";
}

interface EventFormData {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  type: Event["type"];
  status: Event["status"];
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const typeColors = {
  seminar: "bg-blue-100 text-blue-700",
  workshop: "bg-green-100 text-green-700",
  conference: "bg-purple-100 text-purple-700",
  meeting: "bg-orange-100 text-orange-700",
};

function mapEventType(eventType: string): Event["type"] {
  switch (eventType) {
    case "Seminar": return "seminar";
    case "Academic": return "conference";
    case "Sports":
    case "Cultural":
    case "Organizational": return "workshop";
    default: return "meeting";
  }
}

function reverseMapEventType(type: Event["type"]): string {
  switch (type) {
    case "seminar": return "Seminar";
    case "conference": return "Academic";
    case "workshop": return "Cultural";
    default: return "Other";
  }
}

function extractDatePart(value: string) {
  if (!value) return "";
  if (value.includes("T")) return value.split("T")[0];
  return value.slice(0, 10);
}

function extractTimePart(value: string) {
  if (!value) return "";
  if (value.includes("T")) return value.slice(11, 16);
  if (value.length >= 5) return value.slice(0, 5);
  return "";
}

function formatTime(value: string): string {
  if (!value) return "";
  try {
    const d = new Date(`1970-01-01T${value}:00`);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch { return ''; }
}

function formatDate(value: string): string {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

function getDaysUntilEvent(value: string): number {
  if (!value) return Number.NEGATIVE_INFINITY;
  const eventDate = new Date(`${value}T00:00:00`);
  if (Number.isNaN(eventDate.getTime())) return Number.NEGATIVE_INFINITY;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = eventDate.getTime() - today.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function buildDateTime(date: string, time: string): string {
  if (!date || !time) return "";
  return `${date}T${time}:00`;
}

export function Events() {
  const PAGE_SIZE = 10;
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditSuccessModal, setShowEditSuccessModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [editError, setEditError] = useState("");
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    date: "",
    startTime: "09:00",
    endTime: "17:00",
    location: "",
    description: "",
    type: "seminar",
    status: "Upcoming",
  });
  const [editFormData, setEditFormData] = useState<EventFormData>({
    title: "",
    date: "",
    startTime: "09:00",
    endTime: "17:00",
    location: "",
    description: "",
    type: "seminar",
    status: "Upcoming",
  });

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(PAGE_SIZE),
      });
      if (selectedType !== 'all') {
        params.set('type', selectedType);
      }

      const response = await api.get<any[] | { data: any[]; pagination?: PaginationMeta }>(`/events?${params.toString()}`);
      const isLegacyResponse = Array.isArray(response);
      const allRows = isLegacyResponse ? response : (response.data || []);
      const legacyOffset = (currentPage - 1) * PAGE_SIZE;
      const rows = isLegacyResponse
        ? allRows.slice(legacyOffset, legacyOffset + PAGE_SIZE)
        : allRows;
      const meta = isLegacyResponse
        ? {
          page: currentPage,
          limit: PAGE_SIZE,
          total: allRows.length,
          totalPages: Math.max(1, Math.ceil(allRows.length / PAGE_SIZE)),
        }
        : (response.pagination || {
          page: currentPage,
          limit: PAGE_SIZE,
          total: allRows.length,
          totalPages: 1,
        });

      setEvents(rows.map(e => {
        const startDate = extractDatePart(e.start_date || "");
        const startTime = extractTimePart(e.start_date || "");
        const endTime = extractTimePart(e.end_date || "");
        return {
          id: String(e.event_id),
          title: e.title || '',
          date: startDate,
          startTime,
          endTime,
          location: e.venue || '',
          description: e.description || '',
          attendees: e.participant_count || 0,
          type: mapEventType(e.event_type),
          status: e.status || "Upcoming",
        };
      }));
      setPagination({
        page: meta.page,
        limit: meta.limit,
        total: meta.total,
        totalPages: Math.max(1, meta.totalPages),
      });
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentPage, selectedType]);

  const handleAddEvent = async () => {
    setSubmitError('');
    if (!formData.title || !formData.date || !formData.startTime || !formData.endTime || !formData.location) {
      setSubmitError('Please complete all required fields.');
      return;
    }

    const startDateTime = buildDateTime(formData.date, formData.startTime);
    const endDateTime = buildDateTime(formData.date, formData.endTime);
    if (new Date(endDateTime) <= new Date(startDateTime)) {
      setSubmitError('End time must be later than start time.');
      return;
    }

    try {
      await api.post('/events', {
        title: formData.title,
        description: formData.description,
        event_type: reverseMapEventType(formData.type),
        venue: formData.location,
        start_date: startDateTime,
        end_date: endDateTime,
        organizer: '',
        is_mandatory: false,
        status: formData.status,
      });
      await fetchEvents();
    } catch (err) {
      console.error('Failed to add event:', err);
      setSubmitError(err instanceof Error ? err.message : 'Failed to add event');
      return;
    }
    setShowAddModal(false);
    setFormData({
      title: "",
      date: "",
      startTime: "09:00",
      endTime: "17:00",
      location: "",
      description: "",
      type: "seminar",
      status: "Upcoming",
    });
  };

  const handleInputChange = (field: keyof EventFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditInputChange = (field: keyof EventFormData, value: string) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  const openViewModal = (event: Event) => {
    setSelectedEvent(event);
    setShowViewModal(true);
  };

  const openEditModal = (event: Event) => {
    if (getDaysUntilEvent(event.date) < 3) return;
    setEditError('');
    setSelectedEvent(event);
    setEditFormData({
      title: event.title,
      date: event.date,
      startTime: event.startTime || '09:00',
      endTime: event.endTime || '17:00',
      location: event.location,
      description: event.description,
      type: event.type,
      status: event.status,
    });
    setShowEditModal(true);
  };

  const handleUpdateEvent = async () => {
    if (!selectedEvent) return;
    setEditError('');

    const daysUntil = getDaysUntilEvent(selectedEvent.date);
    if (daysUntil < 3) {
      setEditError('Editing is locked within 3 days before the event date.');
      return;
    }

    if (!editFormData.title || !editFormData.date || !editFormData.startTime || !editFormData.endTime || !editFormData.location) {
      setEditError('Please complete all required fields.');
      return;
    }

    const startDateTime = buildDateTime(editFormData.date, editFormData.startTime);
    const endDateTime = buildDateTime(editFormData.date, editFormData.endTime);
    if (new Date(endDateTime) <= new Date(startDateTime)) {
      setEditError('End time must be later than start time.');
      return;
    }

    try {
      await api.put(`/events/${selectedEvent.id}`, {
        title: editFormData.title,
        description: editFormData.description,
        event_type: reverseMapEventType(editFormData.type),
        venue: editFormData.location,
        start_date: startDateTime,
        end_date: endDateTime,
        status: editFormData.status,
      });
      await fetchEvents();
      setShowEditModal(false);
      setSelectedEvent(null);
      setShowEditSuccessModal(true);
    } catch (err) {
      console.error('Failed to update event:', err);
      setEditError(err instanceof Error ? err.message : 'Failed to update event');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Events</h1>
          <p className="text-gray-600">View and manage upcoming college events</p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setCurrentPage(1);
                  setSelectedType("all");
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedType === "all"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Events
              </button>
              <button
                onClick={() => {
                  setCurrentPage(1);
                  setSelectedType("seminar");
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedType === "seminar"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Seminars
              </button>
              <button
                onClick={() => {
                  setCurrentPage(1);
                  setSelectedType("workshop");
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedType === "workshop"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Workshops
              </button>
              <button
                onClick={() => {
                  setCurrentPage(1);
                  setSelectedType("conference");
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedType === "conference"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Conferences
              </button>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Event
            </button>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeColors[event.type]}`}>
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {event.title}
                  </h3>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4">{event.description}</p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{event.date}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">
                    {formatTime(event.startTime)}{event.endTime ? ` - ${formatTime(event.endTime)}` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{event.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{event.attendees} attendees</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => openViewModal(event)}
                    className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => openEditModal(event)}
                    disabled={getDaysUntilEvent(event.date) < 3}
                    className="inline-flex items-center justify-center gap-2 w-full py-2 rounded-lg transition-colors bg-white border border-orange-300 text-orange-700 hover:bg-orange-50 disabled:border-gray-200 disabled:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    title={getDaysUntilEvent(event.date) < 3 ? "Editing is only allowed until 3 days before the event date." : "Edit event"}
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                </div>
                {getDaysUntilEvent(event.date) < 3 && (
                  <p className="mt-2 text-xs text-amber-700">Editing locked (less than 3 days before event date).</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-600">
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} events)
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))}
              disabled={pagination.page <= 1}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((previous) => Math.min(pagination.totalPages, previous + 1))}
              disabled={pagination.page >= pagination.totalPages}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* View Event Modal */}
      {showViewModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Event Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${typeColors[selectedEvent.type]}`}>
                  {selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)}
                </span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900">{selectedEvent.title}</h3>
              <p className="text-sm text-gray-600">{selectedEvent.description || 'No description provided.'}</p>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="mt-1 font-medium text-gray-900">{formatDate(selectedEvent.date)}</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="text-xs text-gray-500">Time</p>
                  <p className="mt-1 font-medium text-gray-900">{formatTime(selectedEvent.startTime)} - {formatTime(selectedEvent.endTime)}</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="text-xs text-gray-500">Venue</p>
                  <p className="mt-1 font-medium text-gray-900">{selectedEvent.location || 'TBA'}</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="text-xs text-gray-500">Attendees</p>
                  <p className="mt-1 font-medium text-gray-900">{selectedEvent.attendees}</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-3 sm:col-span-2">
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="mt-1 font-medium text-gray-900">{selectedEvent.status}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New Event</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {submitError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {submitError}
              </div>
            )}
            <form onSubmit={(e) => { e.preventDefault(); handleAddEvent(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Computer Science Research Symposium"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Event Type *</label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => handleInputChange("type", e.target.value as Event["type"])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="seminar">Seminar</option>
                  <option value="workshop">Workshop</option>
                  <option value="conference">Conference</option>
                  <option value="meeting">Meeting</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Time *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="time"
                      required
                      value={formData.startTime}
                      onChange={(e) => handleInputChange("startTime", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                      type="time"
                      required
                      value={formData.endTime}
                      onChange={(e) => handleInputChange("endTime", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Location *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., CCS Auditorium"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={3}
                  placeholder="Brief description of the event"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Add Event
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Event</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {editError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {editError}
              </div>
            )}
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateEvent(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => handleEditInputChange("title", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Event Type *</label>
                <select
                  required
                  value={editFormData.type}
                  onChange={(e) => handleEditInputChange("type", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="seminar">Seminar</option>
                  <option value="workshop">Workshop</option>
                  <option value="conference">Conference</option>
                  <option value="meeting">Meeting</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={editFormData.date}
                    onChange={(e) => handleEditInputChange("date", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Time *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="time"
                      required
                      value={editFormData.startTime}
                      onChange={(e) => handleEditInputChange("startTime", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                      type="time"
                      required
                      value={editFormData.endTime}
                      onChange={(e) => handleEditInputChange("endTime", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Location *</label>
                <input
                  type="text"
                  required
                  value={editFormData.location}
                  onChange={(e) => handleEditInputChange("location", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => handleEditInputChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
                <textarea
                  required
                  value={editFormData.description}
                  onChange={(e) => handleEditInputChange("description", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Success Modal */}
      {showEditSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900">Edit Successful</h2>
            <p className="mt-2 text-sm text-gray-600">Event changes were saved successfully.</p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowEditSuccessModal(false)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}