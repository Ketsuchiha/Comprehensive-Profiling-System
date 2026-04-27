import { useEffect, useMemo, useState } from "react";
import { BookOpen, CalendarDays, GraduationCap, FlaskConical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { api } from "../utils/api";
import { resolveFacultyId } from "../utils/facultySession";
import { useAuth } from "../context/AuthContext";
import buildingImage from "../../assets/b65a68daf197ee46f7b02d7da02ee101a668ac79.png";

type FacultyDashboardResponse = {
  faculty: {
    faculty_id: string;
    first_name: string;
    last_name: string;
    specialization: string | null;
  };
  summary: {
    assigned_classes: number;
    total_teaching_units: number;
    research_outputs: number;
    authored_syllabi: number;
  };
};

type EventRecord = {
  event_id: number;
  title: string;
  event_type: string | null;
  venue: string | null;
  start_date: string | null;
  status: string | null;
};

type ScheduleRecord = {
  schedule_id: number;
  subject_code: string | null;
  subject_name: string | null;
  section: string | null;
  day_of_week: string | null;
  start_time: string | null;
  end_time: string | null;
  room_name: string | null;
  building: string | null;
};

const dayOrder: Record<string, number> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
};

function normalizeTime(value: string | null) {
  if (!value) return "";
  return value.length === 5 ? `${value}:00` : value;
}

function formatTime(value: string | null) {
  const normalized = normalizeTime(value);
  if (!normalized) return "TBA";
  const date = new Date(`1970-01-01T${normalized}`);
  if (Number.isNaN(date.getTime())) return value || "TBA";
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<FacultyDashboardResponse | null>(null);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [schedules, setSchedules] = useState<ScheduleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setError("No faculty ID found for this session.");
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError("");

    resolveFacultyId(user)
      .then((facultyId) => Promise.all([
        api.get<FacultyDashboardResponse>(`/faculty/${encodeURIComponent(facultyId)}/dashboard`),
        api.get<ScheduleRecord[]>(`/faculty/${encodeURIComponent(facultyId)}/schedules`).catch(() => []),
        api.get<EventRecord[]>("/events").catch(() => []),
      ]))
      .then(([dashboardData, schedulesData, eventsData]) => {
        if (!isMounted) return;
        setDashboard(dashboardData);
        setSchedules(schedulesData);
        setEvents(eventsData);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load faculty dashboard.");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const displayName = useMemo(() => {
    if (!dashboard?.faculty) return user?.name || "Faculty";
    return `${dashboard.faculty.first_name} ${dashboard.faculty.last_name}`.trim();
  }, [dashboard, user?.name]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter((event) => {
        if (!event.start_date) return false;
        const eventDate = new Date(event.start_date);
        return !Number.isNaN(eventDate.getTime()) && eventDate >= now;
      })
      .sort((a, b) => new Date(a.start_date || 0).getTime() - new Date(b.start_date || 0).getTime())
      .slice(0, 5);
  }, [events]);

  const sortedSchedules = useMemo(() => {
    return [...schedules].sort((left, right) => {
      const leftDay = left.day_of_week ? dayOrder[left.day_of_week] ?? 99 : 99;
      const rightDay = right.day_of_week ? dayOrder[right.day_of_week] ?? 99 : 99;
      if (leftDay !== rightDay) return leftDay - rightDay;

      return normalizeTime(left.start_time).localeCompare(normalizeTime(right.start_time));
    });
  }, [schedules]);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-gray-200">
        <img src={buildingImage} alt="Campus" className="h-44 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-gray-900/50" />
        <div className="absolute inset-0 flex items-end justify-between p-6">
          <div>
            <h1 className="text-3xl font-semibold text-white">Welcome, {displayName}</h1>
            <p className="mt-1 text-sm text-gray-100">
              {loading
                ? "Loading faculty dashboard..."
                : `Faculty ID: ${dashboard?.faculty.faculty_id || user?.refId || "N/A"}`}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Your Classes and Time</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sortedSchedules.length === 0 ? (
            <p className="text-sm text-gray-500">No classes assigned yet.</p>
          ) : (
            sortedSchedules.map((schedule) => (
              <div key={schedule.schedule_id} className="rounded-lg border border-gray-200 p-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      {schedule.subject_name || schedule.subject_code || "Class"}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {schedule.subject_code || "Subject"}
                      {schedule.section ? ` • Section ${schedule.section}` : ""}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {schedule.day_of_week || "Day TBA"}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-gray-700">
                  {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                  {schedule.room_name ? ` • ${schedule.room_name}` : ""}
                  {schedule.building ? ` (${schedule.building})` : ""}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Assigned Classes</p>
                <p className="mt-2 text-3xl font-semibold text-orange-600">{dashboard?.summary.assigned_classes ?? 0}</p>
              </div>
              <BookOpen className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Teaching Units</p>
                <p className="mt-2 text-3xl font-semibold text-amber-600">{dashboard?.summary.total_teaching_units ?? 0}</p>
              </div>
              <GraduationCap className="h-6 w-6 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Research Outputs</p>
                <p className="mt-2 text-3xl font-semibold text-orange-600">{dashboard?.summary.research_outputs ?? 0}</p>
              </div>
              <FlaskConical className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Authored Syllabi</p>
                <p className="mt-2 text-3xl font-semibold text-amber-600">{dashboard?.summary.authored_syllabi ?? 0}</p>
              </div>
              <CalendarDays className="h-6 w-6 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingEvents.length === 0 && (
            <p className="text-sm text-gray-500">No upcoming events found.</p>
          )}

          {upcomingEvents.map((event) => (
            <div key={event.event_id} className="rounded-lg border border-gray-200 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900">{event.title}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    {event.start_date ? new Date(event.start_date).toLocaleString() : "Date not set"}
                    {event.venue ? ` • ${event.venue}` : ""}
                  </p>
                </div>
                <Badge variant="outline">{event.event_type || event.status || "Event"}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
