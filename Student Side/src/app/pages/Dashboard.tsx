import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Calendar } from "../components/ui/calendar";
import { AlertCircle, Calendar as CalendarIcon, TrendingUp, BookOpen, Bell } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { useState } from "react";

const mockViolations = [
  {
    id: 1,
    type: "Late Submission",
    subject: "Math 101",
    date: "2026-02-28",
    description: "Assignment submitted 2 hours late for Math 101",
    severity: "Warning",
  },
  {
    id: 2,
    type: "Absence",
    subject: "Physics Lab Session",
    date: "2026-02-25",
    description: "Unauthorized absence from Physics Lab Session",
    severity: "Serious",
  },
  {
    id: 3,
    type: "Dress Code Violation",
    subject: "School Dress Code",
    date: "2026-02-20",
    description: "Did not comply with school dress code on Jan 5",
    severity: "Warning",
  },
];

const mockEvents = [
  { id: 1, title: "Midterm Exams", type: "Academic", description: "Comprehensive midterm examination", date: new Date(2026, 2, 20), time: "08:00 AM", location: "Exam Hall A" },
  { id: 2, title: "Sports Festival", type: "Event", description: "Annual inter-school sports competition", date: new Date(2026, 2, 25), time: "08:00 AM", location: "Sports Complex" },
  { id: 3, title: "Project Submission Deadline", type: "Deadline", description: "Final project submission for all courses", date: new Date(2026, 2, 18), time: "11:59 PM", location: "Online Portal" },
  { id: 4, title: "Career Fair", type: "Event", date: new Date(2026, 2, 10), time: "09:00 AM", location: "Main Auditorium" },
  { id: 5, title: "Department Seminar", type: "Academic", date: new Date(2026, 2, 5), time: "02:00 PM", location: "Conference Room" },
];

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Serious":
        return "bg-orange-100 text-orange-800 border-orange-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "Academic":
        return "bg-blue-50 border-blue-200";
      case "Event":
        return "bg-purple-50 border-purple-200";
      case "Deadline":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getEventTypeTextColor = (type: string) => {
    switch (type) {
      case "Academic":
        return "text-blue-600";
      case "Event":
        return "text-purple-600";
      case "Deadline":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  const eventDates = mockEvents.map(event => event.date);

  const upcomingEvents = mockEvents
    .filter(event => event.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Welcome Back, Maria</h1>
          <p className="mt-1 text-sm text-gray-500">Student ID: 2024-00123 • Year 3 • Section CS-3A</p>
        </div>
        <button className="relative p-2 text-gray-400 hover:text-gray-600">
          <Bell className="h-6 w-6" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-blue-100 bg-white hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current GPA</p>
                <p className="text-4xl font-semibold text-blue-600 mt-2">3.75</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-100 bg-white hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Violations</p>
                <p className="text-4xl font-semibold text-orange-600 mt-2">{mockViolations.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-100 bg-white hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Courses</p>
                <p className="text-4xl font-semibold text-purple-600 mt-2">7</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Violations */}
        <Card className="bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Recent Violations</CardTitle>
                <p className="text-sm text-gray-500 mt-0.5">Your school conduct records</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockViolations.map((violation) => (
              <div
                key={violation.id}
                className={`rounded-lg p-4 border-l-4 ${getSeverityColor(violation.severity)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{violation.type}</h4>
                      <Badge variant="outline" className={`${getSeverityColor(violation.severity)} text-xs`}>
                        {violation.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{violation.description}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(violation.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            ))}
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium w-full text-center py-2">
              View All Violations →
            </button>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Upcoming Events</CardTitle>
                <p className="text-sm text-gray-500 mt-0.5">School activities & deadlines</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <button className="p-1 hover:bg-gray-200 rounded">
                  <span className="text-gray-600">←</span>
                </button>
                <span className="font-medium text-gray-900">March 2026</span>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <span className="text-gray-600">→</span>
                </button>
              </div>
            </div>

            {/* Mini Calendar View */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-gray-500 font-medium py-1">{day}</div>
              ))}
              {/* Calendar days - simplified */}
              {Array.from({ length: 31 }, (_, i) => {
                const day = i + 1;
                const hasEvent = upcomingEvents.some(e => e.date.getDate() === day && e.date.getMonth() === 2);
                return (
                  <div
                    key={day}
                    className={`py-1.5 rounded ${
                      hasEvent 
                        ? "bg-blue-600 text-white font-medium" 
                        : day === 3 
                        ? "bg-gray-200 text-gray-900 font-medium" 
                        : "text-gray-700"
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>

            {/* Event List */}
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className={`rounded-lg p-3 border ${getEventTypeColor(event.type)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className={`font-medium ${getEventTypeTextColor(event.type)}`}>
                      {event.title}
                    </h4>
                    <Badge variant="outline" className={`${getEventTypeColor(event.type)} text-xs border-0 ${getEventTypeTextColor(event.type)}`}>
                      {event.type}
                    </Badge>
                  </div>
                  {event.description && (
                    <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      📅 {event.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </span>
                    {event.time && (
                      <span className="flex items-center gap-1">
                        🕐 {event.time}
                      </span>
                    )}
                    {event.location && (
                      <span className="flex items-center gap-1">
                        📍 {event.location}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}