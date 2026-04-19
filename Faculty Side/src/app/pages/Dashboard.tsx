import { useEffect, useMemo, useState } from "react";
import { BookOpen, CalendarDays, GraduationCap, FlaskConical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { api } from "../utils/api";
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

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<FacultyDashboardResponse | null>(null);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.refId) {
      setLoading(false);
      setError("No faculty ID found for this session.");
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError("");

    Promise.all([
      api.get<FacultyDashboardResponse>(`/faculty/${encodeURIComponent(user.refId)}/dashboard`),
      api.get<EventRecord[]>("/events").catch(() => []),
    ])
      .then(([dashboardData, eventsData]) => {
        if (!isMounted) return;
        setDashboard(dashboardData);
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
  }, [user?.refId]);

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
