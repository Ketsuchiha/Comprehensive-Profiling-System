import { useState, useEffect } from "react";
import { Clock, Plus, Filter, X } from "lucide-react";
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

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function Scheduling() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [subjects, setSubjects] = useState<Array<{ subject_code: string; subject_name: string }>>([]);
  const [facultyOptions, setFacultyOptions] = useState<FacultyOption[]>([]);
  const [roomOptions, setRoomOptions] = useState<RoomOption[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitError, setSubmitError] = useState('');
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
      const data = await api.get<any[]>('/schedules');
      setSchedules(data.map(s => ({
        id: String(s.schedule_id),
        courseCode: s.subject_code || '',
        courseName: s.subject_name || '',
        instructor: `${s.faculty_first_name || ''} ${s.faculty_last_name || ''}`.trim(),
        room: s.room_name || '',
        day: s.day_of_week || '',
        timeStart: s.start_time || '',
        timeEnd: s.end_time || '',
        section: s.section || '',
      })));
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
    fetchSchedules();
    fetchSubjects();
    fetchFaculty();
    fetchRooms();
  }, []);

  const filteredSchedules = selectedDay === "all"
    ? schedules
    : schedules.filter((schedule) => schedule.day === selectedDay);

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
                onChange={(e) => setSelectedDay(e.target.value)}
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
          {filteredSchedules.map((schedule) => (
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

        {/* Weekly View */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Weekly Overview</h2>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => {
              const daySchedules = schedules.filter((s) => s.day === day);
              return (
                <div key={day} className="border border-gray-200 rounded-lg p-2">
                  <h3 className="text-xs font-semibold text-gray-700 mb-2 text-center">
                    {day.slice(0, 3)}
                  </h3>
                  <div className="space-y-1">
                    {daySchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="bg-orange-50 rounded p-1 text-xs"
                      >
                        <p className="font-medium text-orange-700 truncate">
                          {schedule.courseCode}
                        </p>
                        <p className="text-gray-600 text-[10px]">
                          {schedule.timeStart}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

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