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

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function Scheduling() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
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

  useEffect(() => { fetchSchedules(); }, []);

  const filteredSchedules = selectedDay === "all"
    ? schedules
    : schedules.filter((schedule) => schedule.day === selectedDay);

  const handleAddSchedule = async () => {
    try {
      await api.post('/schedules', {
        subject_code: formData.courseCode,
        section: formData.section,
        day_of_week: formData.day,
        start_time: formData.timeStart,
        end_time: formData.timeEnd,
      });
      await fetchSchedules();
    } catch (err) {
      console.error('Failed to add schedule:', err);
    }
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
  };

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
            <form onSubmit={(e) => { e.preventDefault(); handleAddSchedule(); }} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Course Code *</label>
                <input
                  type="text"
                  required
                  value={formData.courseCode}
                  onChange={(e) => handleInputChange("courseCode", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., CS101"
                />
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
                  required
                  value={formData.courseName}
                  onChange={(e) => handleInputChange("courseName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Introduction to Programming"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Instructor *</label>
                <input
                  type="text"
                  required
                  value={formData.instructor}
                  onChange={(e) => handleInputChange("instructor", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Prof. Ana Reyes"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Room *</label>
                <input
                  type="text"
                  required
                  value={formData.room}
                  onChange={(e) => handleInputChange("room", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Lab 301"
                />
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
                  type="text"
                  required
                  value={formData.timeStart}
                  onChange={(e) => handleInputChange("timeStart", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., 8:00 AM"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">End Time *</label>
                <input
                  type="text"
                  required
                  value={formData.timeEnd}
                  onChange={(e) => handleInputChange("timeEnd", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., 10:00 AM"
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