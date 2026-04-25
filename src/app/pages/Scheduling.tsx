import { useState, useEffect, useMemo } from "react";
import { Clock, Plus, Filter, X, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { api } from "../utils/api";

interface Schedule {
  id: string;
  courseCode: string;
  courseName: string;
  instructor: string;
  room: string;
  day: string;
  timeStart: string;
  timeEnd: string;
  section: string;
  studentCount: number;
}

interface FacultyOption {
  faculty_id: string;
  first_name: string;
  last_name: string;
  specialization?: string;
}

interface RoomOption {
  room_id: number;
  room_name: string;
  building?: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function parseScheduleDays(value: string) {
  return value
    .split(',')
    .map((day) => day.trim())
    .filter(Boolean);
}

function isSameDate(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

export function Scheduling() {
  const PAGE_SIZE = 10;
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [calendarSchedules, setCalendarSchedules] = useState<Schedule[]>([]);
  const [subjects, setSubjects] = useState<Array<{ subject_code: string; subject_name: string }>>([]);
  const [facultyOptions, setFacultyOptions] = useState<FacultyOption[]>([]);
  const [roomOptions, setRoomOptions] = useState<RoomOption[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(() => new Date());
  const [showDaySchedulesModal, setShowDaySchedulesModal] = useState(false);
  const [formData, setFormData] = useState<Omit<Schedule, "id">>({
    courseCode: "",
    courseName: "",
    instructor: "",
    room: "",
    day: "Monday",
    timeStart: "",
    timeEnd: "",
    section: "",
  });

  const fetchSchedules = async () => {
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(PAGE_SIZE),
      });
      if (selectedDay !== 'all') {
        params.set('day', selectedDay);
      }

      const response = await api.get<any[] | { data: any[]; pagination?: PaginationMeta }>(`/schedules?${params.toString()}`);
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

      setSchedules(rows.map(s => ({
        id: String(s.schedule_id),
        courseCode: s.subject_code || '',
        courseName: s.subject_name || '',
        instructor: `${s.faculty_first_name || ''} ${s.faculty_last_name || ''}`.trim(),
        room: s.room_name || '',
        day: s.day_of_week || '',
        timeStart: s.start_time || '',
        timeEnd: s.end_time || '',
        section: s.section || '',
        studentCount: Number(s.student_count || 0),
      })));
      setPagination({
        page: meta.page,
        limit: meta.limit,
        total: meta.total,
        totalPages: Math.max(1, meta.totalPages),
      });
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const data = await api.get<Array<{ subject_code: string; subject_name: string }>>('/subjects');
      setSubjects(data);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    }
  };

  const fetchFaculty = async () => {
    try {
      const data = await api.get<FacultyOption[]>('/faculty');
      setFacultyOptions(data);
    } catch (err) {
      console.error('Failed to fetch faculty:', err);
    }
  };

  const fetchRooms = async () => {
    try {
      const data = await api.get<RoomOption[]>('/rooms');
      setRoomOptions(data);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    }
  };

  const normalizeText = (value: string) => value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');

  const fetchCalendarSchedules = async () => {
    try {
      const data = await api.get<any[]>('/schedules/calendar');
      setCalendarSchedules(data.map((s) => ({
        id: String(s.schedule_id),
        courseCode: s.subject_code || '',
        courseName: s.subject_name || '',
        instructor: `${s.faculty_first_name || ''} ${s.faculty_last_name || ''}`.trim(),
        room: s.room_name || '',
        day: s.day_of_week || '',
        timeStart: s.start_time || '',
        timeEnd: s.end_time || '',
        section: s.section || '',
        studentCount: Number(s.student_count || 0),
      })));
    } catch (err) {
      console.error('Failed to fetch calendar schedules:', err);
    }
  };

  const timeToMinutes = (value: string) => {
    if (!value) return Number.MAX_SAFE_INTEGER;
    const [hours, minutes] = value.split(':');
    const parsedHours = Number.parseInt(hours || '0', 10);
    const parsedMinutes = Number.parseInt(minutes || '0', 10);
    return (parsedHours * 60) + parsedMinutes;
  };

  const scoreFacultyForSubject = (subjectName: string, specialization?: string) => {
    if (!specialization) return 0;

    const subject = normalizeText(subjectName);
    const expertise = normalizeText(specialization);

    const networkKeywords = ['network', 'networking', 'cybersecurity', 'security', 'hacking', 'ethical hacking', 'penetration'];
    const appKeywords = ['app', 'application', 'software', 'web', 'mobile', 'programming', 'development'];
    const introKeywords = ['intro', 'introduction', 'fundamentals', 'basic', 'computing'];

    const hasAny = (text: string, terms: string[]) => terms.some((term) => text.includes(term));

    if (hasAny(subject, networkKeywords)) {
      return hasAny(expertise, networkKeywords) ? 3 : 0;
    }
    if (hasAny(subject, appKeywords)) {
      return hasAny(expertise, appKeywords) ? 3 : 0;
    }
    if (hasAny(subject, introKeywords)) {
      return hasAny(expertise, introKeywords) ? 2 : 0;
    }

    return subject.split(' ').some((token) => token.length > 3 && expertise.includes(token)) ? 1 : 0;
  };

  useEffect(() => {
    fetchSubjects();
    fetchFaculty();
    fetchRooms();
    fetchCalendarSchedules();
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [currentPage, selectedDay]);

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);

    const gridStart = new Date(firstOfMonth);
    gridStart.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());

    const gridEnd = new Date(lastOfMonth);
    gridEnd.setDate(lastOfMonth.getDate() + (6 - lastOfMonth.getDay()));

    const daysInGrid: Date[] = [];
    const cursor = new Date(gridStart);

    while (cursor <= gridEnd) {
      daysInGrid.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }

    return daysInGrid;
  }, [calendarMonth]);

  const getSchedulesForDate = (date: Date) => {
    const dayName = weekDays[date.getDay()];
    return calendarSchedules.filter((schedule) => parseScheduleDays(schedule.day).includes(dayName));
  };

  const selectedDateSchedules = useMemo(() => {
    return getSchedulesForDate(selectedCalendarDate)
      .slice()
      .sort((left, right) => timeToMinutes(left.timeStart) - timeToMinutes(right.timeStart));
  }, [selectedCalendarDate, calendarSchedules]);

  const handleAddSchedule = async () => {
    setSubmitError('');
    try {
      await api.post('/schedules', {
        subject_code: formData.courseCode,
        section: formData.section,
        faculty_id: formData.instructor || undefined,
        room_id: formData.room ? Number(formData.room) : undefined,
        day_of_week: formData.day,
        start_time: formData.timeStart,
        end_time: formData.timeEnd,
      });
      await fetchSchedules();
      await fetchCalendarSchedules();
      setShowAddModal(false);
      setFormData({
        courseCode: "",
        courseName: "",
        instructor: "",
        room: "",
        day: "Monday",
        timeStart: "",
        timeEnd: "",
        section: "",
        studentCount: 0,
      });
    } catch (err) {
      console.error('Failed to add schedule:', err);
      setSubmitError(err instanceof Error ? err.message : 'Failed to add schedule');
    }
  };

  const selectedSubjectName = subjects.find((subject) => subject.subject_code === formData.courseCode)?.subject_name || '';
  const recommendedFaculty = selectedSubjectName
    ? facultyOptions
      .map((faculty) => ({ faculty, score: scoreFacultyForSubject(selectedSubjectName, faculty.specialization) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.faculty)
    : [];

  const recommendedFacultyIds = new Set(recommendedFaculty.map((faculty) => faculty.faculty_id));
  const otherFaculty = facultyOptions.filter((faculty) => !recommendedFacultyIds.has(faculty.faculty_id));

  const handleInputChange = (field: keyof Omit<Schedule, "id">, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Scheduling</h1>
          <p className="text-gray-600">View and manage class schedules</p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={selectedDay}
                onChange={(e) => {
                  setCurrentPage(1);
                  setSelectedDay(e.target.value);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Days</option>
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Schedule
            </button>
          </div>
        </div>

        {/* Schedule Cards */}
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium">
                      {schedule.courseCode}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                      {schedule.section}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {schedule.courseName}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Instructor</p>
                      <p className="text-sm font-medium text-gray-900">
                        {schedule.instructor}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Room</p>
                      <p className="text-sm font-medium text-gray-900">
                        {schedule.room}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Day</p>
                      <p className="text-sm font-medium text-gray-900">
                        {schedule.day}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Time</p>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <p className="text-sm font-medium text-gray-900">
                          {schedule.timeStart} - {schedule.timeEnd}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-600">
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} schedules)
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

        {/* Monthly View */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-gray-900">Monthly Overview</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCalendarMonth((previous) => new Date(previous.getFullYear(), previous.getMonth() - 1, 1))}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <CalendarDays className="h-4 w-4" />
                Today
              </button>
              <button
                type="button"
                onClick={() => setCalendarMonth((previous) => new Date(previous.getFullYear(), previous.getMonth() + 1, 1))}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <p className="mb-4 text-sm text-gray-600">
            {calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
            {weekDays.map((day) => (
              <div key={day}>{day.slice(0, 3)}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((dateValue) => {
              const daySchedules = getSchedulesForDate(dateValue)
                .slice()
                .sort((left, right) => timeToMinutes(left.timeStart) - timeToMinutes(right.timeStart));
              const isCurrentMonth = dateValue.getMonth() === calendarMonth.getMonth();
              const isToday = isSameDate(dateValue, new Date());
              const isSelected = isSameDate(dateValue, selectedCalendarDate);

              return (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCalendarDate(new Date(dateValue));
                    setShowDaySchedulesModal(true);
                  }}
                  key={`${dateValue.getFullYear()}-${dateValue.getMonth()}-${dateValue.getDate()}`}
                  className={`min-h-28 rounded-lg border p-2 ${
                    isCurrentMonth ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50"
                  } ${isToday ? "ring-2 ring-orange-400" : ""} ${isSelected ? "border-orange-400 ring-2 ring-orange-300" : ""} text-left hover:border-orange-300 hover:bg-orange-50/30 transition-colors`}
                >
                  <div className={`mb-2 text-xs font-semibold ${isCurrentMonth ? "text-gray-800" : "text-gray-400"}`}>
                    {dateValue.getDate()}
                  </div>
                  <div className="space-y-1">
                    {daySchedules.slice(0, 2).map((schedule) => (
                      <div key={`${dateValue.toISOString()}-${schedule.id}`} className="rounded bg-orange-50 px-1.5 py-1 text-[10px]">
                        <p className="truncate font-medium text-orange-700">{schedule.courseCode}</p>
                        <p className="truncate text-gray-600">{schedule.timeStart} - {schedule.timeEnd}</p>
                      </div>
                    ))}
                    {daySchedules.length > 2 && (
                      <p className="text-[10px] font-medium text-orange-700">+{daySchedules.length - 2} more</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-gray-500">Click a day to view all classes in a modal.</p>
        </div>
      </div>

      {/* Day Schedules Modal */}
      {showDaySchedulesModal && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowDaySchedulesModal(false)}
        >
          <div
            className="w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Classes on {selectedCalendarDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedDateSchedules.length} class{selectedDateSchedules.length === 1 ? "" : "es"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDaySchedulesModal(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close class details modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
              {selectedDateSchedules.length === 0 ? (
                <p className="text-sm text-gray-600">No classes scheduled for this day.</p>
              ) : (
                <div className="space-y-2">
                  {selectedDateSchedules.map((schedule) => (
                    <div
                      key={`modal-selected-${schedule.id}`}
                      className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="rounded bg-orange-100 px-2 py-0.5 font-semibold text-orange-700">
                            {schedule.timeStart} - {schedule.timeEnd}
                          </span>
                          <span className="font-semibold text-gray-900">{schedule.courseCode}</span>
                          {schedule.courseName && (
                            <span className="text-gray-700">{schedule.courseName}</span>
                          )}
                        </div>
                        <span className="shrink-0 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                          {schedule.studentCount} student{schedule.studentCount === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-600">
                        {schedule.section && <span>Section: {schedule.section}</span>}
                        <span>Proctor: {schedule.instructor || 'Not assigned'}</span>
                        {schedule.room && <span>Room: {schedule.room}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New Schedule</h2>
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
            <form onSubmit={(e) => { e.preventDefault(); handleAddSchedule(); }} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Course Code *</label>
                <select
                  required
                  value={formData.courseCode}
                  onChange={(e) => {
                    const selectedCode = e.target.value;
                    const selectedSubject = subjects.find((s) => s.subject_code === selectedCode);
                    setFormData((prev) => ({
                      ...prev,
                      courseCode: selectedCode,
                      courseName: selectedSubject?.subject_name || prev.courseName,
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select subject code</option>
                  {subjects.map((subject) => (
                    <option key={subject.subject_code} value={subject.subject_code}>
                      {subject.subject_code} - {subject.subject_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Section *</label>
                <input
                  type="text"
                  required
                  value={formData.section}
                  onChange={(e) => handleInputChange("section", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., CS-1A"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Course Name *</label>
                <input
                  type="text"
                  value={formData.courseName}
                  onChange={(e) => handleInputChange("courseName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Introduction to Programming"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Instructor *</label>
                <select
                  value={formData.instructor}
                  onChange={(e) => handleInputChange("instructor", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select instructor</option>
                  {recommendedFaculty.length > 0 && (
                    <optgroup label="Recommended by expertise">
                      {recommendedFaculty.map((faculty) => (
                        <option key={faculty.faculty_id} value={faculty.faculty_id}>
                          {faculty.first_name} {faculty.last_name} ({faculty.specialization || 'No expertise set'})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="Other instructors">
                    {otherFaculty.map((faculty) => (
                      <option key={faculty.faculty_id} value={faculty.faculty_id}>
                        {faculty.first_name} {faculty.last_name} ({faculty.specialization || 'No expertise set'})
                      </option>
                    ))}
                  </optgroup>
                </select>
                {selectedSubjectName && recommendedFaculty.length === 0 && (
                  <p className="mt-1 text-xs text-amber-700">No direct expertise match found for {selectedSubjectName}. Please assign manually.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Room *</label>
                <select
                  value={formData.room}
                  onChange={(e) => handleInputChange("room", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select room</option>
                  {roomOptions.map((room) => (
                    <option key={room.room_id} value={String(room.room_id)}>
                      {room.room_name}{room.building ? ` (${room.building})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Day *</label>
                <select
                  required
                  value={formData.day}
                  onChange={(e) => handleInputChange("day", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Start Time *</label>
                <input
                  type="time"
                  required
                  value={formData.timeStart}
                  onChange={(e) => handleInputChange("timeStart", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">End Time *</label>
                <input
                  type="time"
                  required
                  value={formData.timeEnd}
                  onChange={(e) => handleInputChange("timeEnd", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="col-span-2 flex gap-3 mt-4">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Add Schedule
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