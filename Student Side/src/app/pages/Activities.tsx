import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Users, Briefcase, Clock, BookOpen, CalendarDays, MapPin, CircleCheckBig } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { useEffect, useMemo, useState } from "react";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

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
  participation_id?: number | null;
  participant_count?: number | null;
  student_participant_count?: number | null;
};

type EventSummaryRecord = {
  event_id: number;
  participant_count: number | null;
  student_participant_count: number | null;
};

type StatusMessage = {
  type: "success" | "error";
  message: string;
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
  const [eventSummary, setEventSummary] = useState<EventSummaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isUpdatingAttendance, setIsUpdatingAttendance] = useState(false);
  const [eventStatus, setEventStatus] = useState<StatusMessage | null>(null);

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
      api.get<EventSummaryRecord[]>(`/events`).catch(() => []),
    ])
      .then(([orgs, internshipsData, schedulesData, eventsData, eventSummaryData]) => {
        if (!isMounted) return;
        setOrganizations(orgs);
        setInternships(internshipsData);
        setSchedules(schedulesData);
        setEvents(eventsData);
        setEventSummary(eventSummaryData);
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

  const eventSummaryMap = useMemo(() => {
    return new Map(eventSummary.map((item) => [String(item.event_id), item]));
  }, [eventSummary]);

  const mergedEvents = useMemo(
    () => [...events].map((event) => {
      const summary = eventSummaryMap.get(String(event.event_id));
      const participantCount = Number(summary?.participant_count ?? event.participant_count ?? 0);
      const studentParticipantCount = Number(
        summary?.student_participant_count
        ?? event.student_participant_count
        ?? summary?.participant_count
        ?? event.participant_count
        ?? 0
      );

      return {
        ...event,
        participant_count: participantCount,
        student_participant_count: studentParticipantCount,
      };
    }),
    [eventSummaryMap, events]
  );

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

  const formatEventDateState = (event: EventRecord) => {
    const startDate = new Date(event.start_date);
    if (Number.isNaN(startDate.getTime())) return false;
    return startDate.getTime() <= Date.now();
  };

  const openEventDialog = (event: EventRecord) => {
    setSelectedEvent(event);
    setEventStatus(null);
    setIsEventDialogOpen(true);
  };

  const handleMarkAttended = async () => {
    if (!selectedEvent?.participation_id) {
      setEventStatus({
        type: "error",
        message: "This event does not have a participation record in the database.",
      });
      return;
    }

    if (!formatEventDateState(selectedEvent)) {
      setEventStatus({
        type: "error",
        message: "You can only mark attendance after the event has started.",
      });
      return;
    }

    setIsUpdatingAttendance(true);
    setEventStatus(null);

    try {
      await api.put<{ message: string }>(`/events/participants/${selectedEvent.participation_id}`, {
        attendance: "Attended",
      });

      setEvents((previous) => previous.map((event) => (
        event.participation_id === selectedEvent.participation_id
          ? { ...event, attendance: "Attended" }
          : event
      )));
      setSelectedEvent((previous) => (previous ? { ...previous, attendance: "Attended" } : previous));
      setEventStatus({
        type: "success",
        message: "Attendance marked as attended successfully.",
      });
      setIsEventDialogOpen(false);
    } catch (err) {
      setEventStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to update event attendance.",
      });
    } finally {
      setIsUpdatingAttendance(false);
    }
  };

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
              {mergedEvents.map((event) => (
                <button
                  key={event.event_id}
                  type="button"
                  onClick={() => openEventDialog(event)}
                  className="w-full rounded-lg border bg-orange-50 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-sm"
                >
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
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Event Participation</DialogTitle>
            <DialogDescription>
              Review the event record and confirm attendance only when the event has already started.
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-3">
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">{selectedEvent.title}</p>
                <p className="mt-1 text-sm text-gray-600">{selectedEvent.event_type || "Event"}</p>
              </div>

              <div className="space-y-1 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Start:</span> {formatDateTimeValue(selectedEvent.start_date)}
                </p>
                <p>
                  <span className="font-medium">End:</span> {formatDateTimeValue(selectedEvent.end_date)}
                </p>
                <p>
                  <span className="font-medium">Current attendance:</span> {selectedEvent.attendance || "Registered"}
                </p>
              </div>

              {!formatEventDateState(selectedEvent) && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  You cannot mark this event as attended yet because the event has not started.
                </div>
              )}

              {eventStatus && (
                <div
                  className={`rounded-lg px-3 py-2 text-sm ${
                    eventStatus.type === "error"
                      ? "border border-red-200 bg-red-50 text-red-700"
                      : "border border-green-200 bg-green-50 text-green-700"
                  }`}
                >
                  {eventStatus.message}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsEventDialogOpen(false)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleMarkAttended}
              disabled={!selectedEvent || !formatEventDateState(selectedEvent) || isUpdatingAttendance || selectedEvent?.attendance === "Attended"}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-orange-300"
            >
              <CircleCheckBig className="h-4 w-4" />
              {isUpdatingAttendance ? "Saving..." : selectedEvent?.attendance === "Attended" ? "Already Attended" : "Mark Attended"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}