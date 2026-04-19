import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Users, Briefcase, Clock, BookOpen, CalendarDays, MapPin } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { useEffect, useMemo, useState } from "react";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";

type OrgRecord = {
  org_id: number;
  organization_name: string;
  position: string | null;
  academic_year: string | null;
};

type InternshipRecord = {
  internship_id: number;
  company_name: string;
  supervisor: string | null;
  start_date: string | null;
  end_date: string | null;
  hours_rendered: number | null;
};

type ScheduleRecord = {
  schedule_id: number;
  subject_code: string;
  subject_name: string | null;
  section: string | null;
  day_of_week: string | null;
  start_time: string | null;
  end_time: string | null;
  faculty_id: string | null;
  faculty_first_name: string | null;
  faculty_last_name: string | null;
  room_name: string | null;
  building: string | null;
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

function formatMonthYear(value: string | null) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatTimeValue(value: string | null) {
  if (!value) return "TBA";
  const normalized = value.length === 5 ? `${value}:00` : value;
  const date = new Date(`1970-01-01T${normalized}`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatDateTimeValue(value: string | null) {
  if (!value) return "TBA";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function daySortWeight(dayValue: string | null) {
  if (!dayValue) return 99;
  const firstDay = dayValue.split(",")[0]?.trim();
  const dayMap: Record<string, number> = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };
  return dayMap[firstDay] ?? 99;
}

export default function Activities() {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<OrgRecord[]>([]);
  const [internships, setInternships] = useState<InternshipRecord[]>([]);
  const [schedules, setSchedules] = useState<ScheduleRecord[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.refId) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    Promise.all([
      api.get<OrgRecord[]>(`/students/${encodeURIComponent(user.refId)}/orgs`).catch(() => []),
      api.get<InternshipRecord[]>(`/students/${encodeURIComponent(user.refId)}/internships`).catch(() => []),
      api.get<ScheduleRecord[]>(`/students/${encodeURIComponent(user.refId)}/schedules`).catch(() => []),
      api.get<EventRecord[]>(`/students/${encodeURIComponent(user.refId)}/events`).catch(() => []),
    ])
      .then(([orgs, internshipsData, schedulesData, eventsData]) => {
        if (!isMounted) return;
        setOrganizations(orgs);
        setInternships(internshipsData);
        setSchedules(schedulesData);
        setEvents(eventsData);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user?.refId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
      case "Ongoing":
        return "bg-green-100 text-green-700 border-green-200 hover:bg-green-100";
      case "Completed":
        return "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100";
      case "Inactive":
        return "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100";
    }
  };

  const totalInternshipHours = useMemo(() => internships.reduce(
    (sum, internship) => sum + (internship.hours_rendered || 0),
    0
  ), [internships]);

  const sortedSchedules = useMemo(
    () => [...schedules].sort((left, right) => {
      const dayDiff = daySortWeight(left.day_of_week) - daySortWeight(right.day_of_week);
      if (dayDiff !== 0) return dayDiff;
      const leftTime = left.start_time || "99:99:99";
      const rightTime = right.start_time || "99:99:99";
      return leftTime.localeCompare(rightTime);
    }),
    [schedules]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">
          Activities & Engagement
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Your organizational involvement, internships, and achievements.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-700 font-medium">Organizations</p>
                <p className="text-2xl font-semibold text-blue-900 mt-0.5">
                  {organizations.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-purple-700 font-medium">Internships</p>
                <p className="text-2xl font-semibold text-purple-900 mt-0.5">
                  {internships.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-700 font-medium">Total Hours</p>
                <p className="text-2xl font-semibold text-green-900 mt-0.5">
                  {totalInternshipHours}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-amber-700 font-medium">Classes</p>
                <p className="text-2xl font-semibold text-amber-900 mt-0.5">{schedules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                <CalendarDays className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-orange-700 font-medium">Events</p>
                <p className="text-2xl font-semibold text-orange-900 mt-0.5">{events.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classes */}
      <Card className="bg-white">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-amber-600" />
            </div>
            <CardTitle>Class Schedule</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-sm text-gray-500">Loading class schedules...</p>
          ) : sortedSchedules.length === 0 ? (
            <p className="text-sm text-gray-500">No classes found for your section yet.</p>
          ) : (
            <div className="space-y-3">
              {sortedSchedules.map((schedule) => {
                const facultyName = [schedule.faculty_first_name, schedule.faculty_last_name]
                  .filter(Boolean)
                  .join(" ") || schedule.faculty_id || "TBA";

                return (
                  <div key={schedule.schedule_id} className="rounded-lg border bg-amber-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {schedule.subject_name || schedule.subject_code}
                        </h4>
                        <p className="mt-1 text-sm text-amber-700">{schedule.subject_code}</p>
                      </div>
                      <Badge variant="outline" className="bg-white text-amber-700 border-amber-200">
                        Section {schedule.section || "-"}
                      </Badge>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
                      <p>
                        <span className="font-medium">Schedule:</span> {schedule.day_of_week || "TBA"} • {formatTimeValue(schedule.start_time)} - {formatTimeValue(schedule.end_time)}
                      </p>
                      <p>
                        <span className="font-medium">Instructor:</span> {facultyName}
                      </p>
                      <p className="sm:col-span-2">
                        <span className="font-medium">Room:</span> {schedule.room_name || "TBA"}{schedule.building ? ` (${schedule.building})` : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Organizations */}
      <Card className="bg-white">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <CardTitle>Organization Membership</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-sm text-gray-500">Loading organization records...</p>
          ) : organizations.length === 0 ? (
            <p className="text-sm text-gray-500">No organization records found.</p>
          ) : (
          <div className="space-y-3">
            {organizations.map((org) => (
              <div
                key={org.org_id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-all bg-gray-50"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {org.organization_name}
                  </h4>
                  <p className="text-sm text-blue-600 font-medium mt-1">{org.position || "Member"}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Academic Year: {org.academic_year || "N/A"}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`mt-3 sm:mt-0 ${getStatusColor("Active")} w-fit`}
                >
                  Active
                </Badge>
              </div>
            ))}
          </div>
          )}
        </CardContent>
      </Card>

      {/* Internships */}
      <Card className="bg-white">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-purple-600" />
            </div>
            <CardTitle>Internship Experience</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-sm text-gray-500">Loading internship records...</p>
          ) : internships.length === 0 ? (
            <p className="text-sm text-gray-500">No internship records found.</p>
          ) : (
          <div className="space-y-3">
            {internships.map((internship) => (
              <div
                key={internship.internship_id}
                className="p-4 border rounded-lg hover:shadow-sm transition-all bg-gray-50"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {internship.company_name}
                        </h4>
                        <p className="text-sm text-purple-600 font-medium mt-1">
                          {internship.supervisor || "Internship"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-3 text-xs">
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-gray-200">
                        <Clock className="h-3 w-3 text-gray-600" />
                        <span className="font-medium text-gray-700">{internship.hours_rendered || 0} hours</span>
                      </span>
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-gray-200">
                        <span className="font-medium text-gray-700">
                          {formatMonthYear(internship.start_date)} - {formatMonthYear(internship.end_date)}
                        </span>
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={getStatusColor(internship.end_date ? "Completed" : "Ongoing")}
                  >
                    {internship.end_date ? "Completed" : "Ongoing"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          )}
        </CardContent>
      </Card>

      {/* Events */}
      <Card className="bg-white">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <CalendarDays className="h-4 w-4 text-orange-600" />
            </div>
            <CardTitle>Event Participation</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-sm text-gray-500">Loading event records...</p>
          ) : events.length === 0 ? (
            <p className="text-sm text-gray-500">No event participation records found.</p>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.event_id} className="rounded-lg border bg-orange-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{event.title}</h4>
                      <p className="mt-1 text-sm text-orange-700">{event.event_type || "Event"}</p>
                    </div>
                    <Badge variant="outline" className={getStatusColor(event.attendance || event.status || "Active")}>
                      {event.attendance || event.status || "Recorded"}
                    </Badge>
                  </div>

                  {event.description && <p className="mt-2 text-sm text-gray-600">{event.description}</p>}

                  <div className="mt-3 space-y-1 text-sm text-gray-700">
                    <p>
                      <span className="font-medium">Start:</span> {formatDateTimeValue(event.start_date)}
                    </p>
                    <p>
                      <span className="font-medium">End:</span> {formatDateTimeValue(event.end_date)}
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
  );
}