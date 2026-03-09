import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Plus, MapPin, Users, Clock, X } from "lucide-react";
import { api } from "../utils/api";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  attendees: number;
  type: "seminar" | "workshop" | "conference" | "meeting";
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

function formatTime(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch { return ''; }
}

export function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<Omit<Event, "id">>({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    attendees: 0,
    type: "seminar",
  });

  const fetchEvents = async () => {
    try {
      const data = await api.get<any[]>('/events');
      setEvents(data.map(e => {
        const startDate = e.start_date ? e.start_date.split('T')[0] : '';
        const startTime = e.start_date ? formatTime(e.start_date) : '';
        const endTime = e.end_date ? formatTime(e.end_date) : '';
        const time = startTime && endTime ? `${startTime} - ${endTime}` : startTime;
        return {
          id: String(e.event_id),
          title: e.title || '',
          date: startDate,
          time,
          location: e.venue || '',
          description: e.description || '',
          attendees: e.participant_count || 0,
          type: mapEventType(e.event_type),
        };
      }));
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const filteredEvents = selectedType === "all" 
    ? events 
    : events.filter(event => event.type === selectedType);

  const handleAddEvent = async () => {
    try {
      const reverseTypeMap: Record<string, string> = {
        seminar: "Seminar",
        conference: "Academic",
        workshop: "Sports",
        meeting: "Other",
      };
      const startDateTime = formData.date ? `${formData.date}T09:00:00` : '';
      const endDateTime = formData.date ? `${formData.date}T17:00:00` : '';
      await api.post('/events', {
        title: formData.title,
        description: formData.description,
        event_type: reverseTypeMap[formData.type] || 'Other',
        venue: formData.location,
        start_date: startDateTime,
        end_date: endDateTime,
        organizer: '',
        is_mandatory: false,
        status: 'Upcoming',
      });
      await fetchEvents();
    } catch (err) {
      console.error('Failed to add event:', err);
    }
    setShowAddModal(false);
    setFormData({
      title: "",
      date: "",
      time: "",
      location: "",
      description: "",
      attendees: 0,
      type: "seminar",
    });
  };

  const handleInputChange = (field: keyof Omit<Event, "id">, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
                onClick={() => setSelectedType("all")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedType === "all"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Events
              </button>
              <button
                onClick={() => setSelectedType("seminar")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedType === "seminar"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Seminars
              </button>
              <button
                onClick={() => setSelectedType("workshop")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedType === "workshop"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Workshops
              </button>
              <button
                onClick={() => setSelectedType("conference")}
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
          {filteredEvents.map((event) => (
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
                  <span className="text-gray-700">{event.time}</span>
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
                <button className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

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
                  <input
                    type="text"
                    required
                    value={formData.time}
                    onChange={(e) => handleInputChange("time", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., 9:00 AM - 5:00 PM"
                  />
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
                <label className="block text-sm font-semibold text-gray-700 mb-1">Expected Attendees *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.attendees || ""}
                  onChange={(e) => handleInputChange("attendees", parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
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
    </div>
  );
}