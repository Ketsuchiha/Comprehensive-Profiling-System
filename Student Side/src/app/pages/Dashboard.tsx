import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { AlertCircle, Calendar as CalendarIcon, TrendingUp, BookOpen, Bell, MapPin, Clock } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { useEffect, useMemo, useState } from "react";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import buildingImage from "../../assets/b65a68daf197ee46f7b02d7da02ee101a668ac79.png";

type ViolationRecord = {
  violation_id: number;
  violation_type: string;
  subject_context: string | null;
  description: string | null;
  severity: string | null;
  status: string | null;
  incident_date: string;
};

type EventRecord = {
  event_id: number;
  title: string;
  description: string | null;
  event_type: string | null;
  venue: string | null;
  start_date: string;
  end_date: string;
  status: string | null;
  attendance: string | null;
};

function toDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value: string) {
  const date = toDate(value);
  if (!date) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTime(value: string) {
  const date = toDate(value);
  if (!date) return value;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<{
    total_subjects: number;
    average_final_grade: number | null;
    total_schedules: number;
    registered_events: number;
    active_violations?: number;
  } | null>(null);
  const [student, setStudent] = useState<{
    student_id: string;
    first_name: string;
    last_name: string;
    year_level: number | null;
    section: string | null;
  } | null>(null);
  const [violations, setViolations] = useState<ViolationRecord[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);

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
        return "bg-orange-50 border-orange-200";
      case "Event":
        return "bg-amber-50 border-amber-200";
      case "Deadline":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getEventTypeTextColor = (type: string) => {
    switch (type) {
      case "Academic":
        return "text-orange-600";
      case "Event":
        return "text-amber-600";
      case "Deadline":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  useEffect(() => {
    if (!user?.refId) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    Promise.all([
      api
        .get<{
          student: {
            student_id: string;
            first_name: string;
            last_name: string;
            year_level: number | null;
            section: string | null;
          };
          summary: {
            total_subjects: number;
            average_final_grade: number | null;
            total_schedules: number;
            registered_events: number;
            active_violations?: number;
          };
        }>(`/students/${encodeURIComponent(user.refId)}/dashboard`)
        .catch(() => null),
      api.get<ViolationRecord[]>(`/students/${encodeURIComponent(user.refId)}/violations`).catch(() => []),
      api.get<EventRecord[]>(`/students/${encodeURIComponent(user.refId)}/events`).catch(() => []),
    ])
      .then(([dashboardData, violationData, eventData]) => {
        if (!isMounted) return;
        const normalizedSummary = dashboardData?.summary
          ? {
              total_subjects: toNumber(dashboardData.summary.total_subjects) ?? 0,
              average_final_grade: toNumber(dashboardData.summary.average_final_grade),
              total_schedules: toNumber(dashboardData.summary.total_schedules) ?? 0,
              registered_events: toNumber(dashboardData.summary.registered_events) ?? 0,
              active_violations: toNumber(dashboardData.summary.active_violations) ?? undefined,
            }
          : null;
        setStudent(dashboardData?.student || null);
        setSummary(normalizedSummary);
        setViolations(violationData);
        setEvents(eventData);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user?.refId]);

  const displayName = useMemo(() => {
    if (!student) return user?.name || "Student";
    return `${student.first_name} ${student.last_name}`.trim();
  }, [student, user?.name]);

  const displayMeta = useMemo(() => {
    if (!student) return `Student ID: ${user?.refId || "N/A"}`;
    return `Student ID: ${student.student_id} • Year ${student.year_level ?? "-"} • Section ${student.section || "-"}`;
  }, [student, user?.refId]);

  const currentGpa =
    summary?.average_final_grade != null && Number.isFinite(summary.average_final_grade)
      ? summary.average_final_grade.toFixed(2)
      : "-";

  const activeViolationCount = summary?.active_violations ?? violations.filter((violation) => violation.status === "Active").length;

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter((event) => {
        const startDate = toDate(event.start_date);
        return startDate ? startDate >= now : false;
      })
      .sort((left, right) => {
        const leftDate = toDate(left.start_date);
        const rightDate = toDate(right.start_date);
        if (!leftDate || !rightDate) return 0;
        return leftDate.getTime() - rightDate.getTime();
      })
      .slice(0, 4);
  }, [events]);

  const recentViolations = useMemo(
    () => [...violations].slice(0, 4),
    [violations]
  );

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-gray-200">
        <img src={buildingImage} alt="Campus" className="h-44 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-gray-900/50" />
        <div className="absolute inset-0 flex items-end justify-between p-6">
          <div>
            <h1 className="text-3xl font-semibold text-white">Welcome Back, {displayName}</h1>
            <p className="mt-1 text-sm text-gray-100">{loading ? "Loading student dashboard..." : displayMeta}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          aria-label="Notifications"
          title="Notifications"
          className="relative p-2 text-gray-400 hover:text-gray-600"
        >
          <Bell className="h-6 w-6" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-orange-100 bg-white hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current GPA</p>
                <p className="text-4xl font-semibold text-orange-600 mt-2">{currentGpa}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-100 bg-white hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Violations</p>
                <p className="text-4xl font-semibold text-orange-600 mt-2">{activeViolationCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-100 bg-white hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Courses</p>
                <p className="text-4xl font-semibold text-amber-600 mt-2">{summary?.total_subjects ?? 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-amber-600" />
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
            {loading ? (
              <p className="text-sm text-gray-500">Loading violations...</p>
            ) : recentViolations.length === 0 ? (
              <p className="text-sm text-gray-500">No violation records found.</p>
            ) : (
              recentViolations.map((violation) => (
                <div
                  key={violation.violation_id}
                  className={`rounded-lg p-4 border-l-4 ${getSeverityColor(violation.severity || "Warning")}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{violation.violation_type}</h4>
                        <Badge variant="outline" className={`${getSeverityColor(violation.severity || "Warning")} text-xs`}>
                          {violation.severity || "Warning"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{violation.description || violation.subject_context || "No description"}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{formatDate(violation.incident_date)}</p>
                </div>
              ))
            )}
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
            {loading ? (
              <p className="text-sm text-gray-500">Loading events...</p>
            ) : upcomingEvents.length === 0 ? (
              <p className="text-sm text-gray-500">No upcoming events found.</p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.event_id}
                    className={`rounded-lg p-3 border ${getEventTypeColor(event.event_type || "Event")}`}
                  >
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <h4 className={`font-medium ${getEventTypeTextColor(event.event_type || "Event")}`}>
                        {event.title}
                      </h4>
                      <Badge variant="outline" className={`${getEventTypeColor(event.event_type || "Event")} text-xs border-0 ${getEventTypeTextColor(event.event_type || "Event")}`}>
                        {event.event_type || "Event"}
                      </Badge>
                    </div>
                    {event.description && (
                      <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                    )}
                    <div className="space-y-1 text-xs text-gray-600">
                      <p className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{formatDateTime(event.start_date)} to {formatDateTime(event.end_date)}</span>
                      </p>
                      <p className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{event.venue || "Venue TBA"}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}