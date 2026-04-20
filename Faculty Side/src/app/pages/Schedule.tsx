import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";

type FacultyScheduleRecord = {
  schedule_id: number;
  subject_code: string | null;
  subject_name: string | null;
  section: string | null;
  room_id: number | null;
  semester: string | null;
  academic_year: string | null;
  day_of_week: string | null;
  start_time: string | null;
  end_time: string | null;
  schedule_type: string | null;
  room_name: string | null;
  building: string | null;
};

const DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function parseDays(dayValue: string | null): string[] {
  if (!dayValue) return [];
  return dayValue
    .split(",")
    .map((day) => day.trim())
    .filter(Boolean);
}

function formatTime(timeValue: string | null): string {
  if (!timeValue) return "-";
  const [h = "00", m = "00", s = "00"] = timeValue.split(":");
  const date = new Date(`1970-01-01T${h}:${m}:${s}`);
  if (Number.isNaN(date.getTime())) return timeValue;
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function getSortOrder(record: FacultyScheduleRecord): number {
  const days = parseDays(record.day_of_week);
  if (days.length === 0) return 999;
  const indexes = days.map((day) => DAY_ORDER.indexOf(day)).filter((index) => index >= 0);
  if (indexes.length === 0) return 999;
  return Math.min(...indexes);
}

export default function Schedule() {
  const { user } = useAuth();
  const [rows, setRows] = useState<FacultyScheduleRecord[]>([]);
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

    api
      .get<FacultyScheduleRecord[]>(`/faculty/${encodeURIComponent(user.refId)}/schedules`)
      .then((data) => {
        if (!isMounted) return;
        const sorted = [...data].sort((a, b) => {
          const dayDiff = getSortOrder(a) - getSortOrder(b);
          if (dayDiff !== 0) return dayDiff;
          return String(a.start_time || "").localeCompare(String(b.start_time || ""));
        });
        setRows(sorted);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load faculty schedule.");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user?.refId]);

  const uniqueDays = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((row) => {
      parseDays(row.day_of_week).forEach((day) => set.add(day));
    });
    return DAY_ORDER.filter((day) => set.has(day)).length;
  }, [rows]);

  const uniqueSubjects = useMemo(() => {
    const set = new Set(rows.map((row) => row.subject_code).filter(Boolean));
    return set.size;
  }, [rows]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">My Schedule</h1>
        <p className="mt-1 text-sm text-gray-500">Your teaching schedule by day, time, and room assignment.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-600">Schedule Slots</p>
                <p className="mt-1 text-3xl font-semibold text-orange-600">{rows.length}</p>
              </div>
              <Clock3 className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-600">Teaching Days</p>
                <p className="mt-1 text-3xl font-semibold text-amber-600">{uniqueDays}</p>
              </div>
              <CalendarDays className="h-6 w-6 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-600">Subjects</p>
                <p className="mt-1 text-3xl font-semibold text-orange-600">{uniqueSubjects}</p>
              </div>
              <BookOpen className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white">
        <CardHeader className="border-b border-gray-100">
          <CardTitle>Teaching Schedule Table</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-sm text-gray-500">Loading your schedule...</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-gray-500">No schedule records found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Day</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Term</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const days = parseDays(row.day_of_week);
                  const roomLabel = row.room_name
                    ? `${row.room_name}${row.building ? ` (${row.building})` : ""}`
                    : "TBA";

                  return (
                    <TableRow key={row.schedule_id}>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {days.length === 0 ? (
                            <span>-</span>
                          ) : (
                            days.map((day) => (
                              <Badge key={`${row.schedule_id}-${day}`} variant="outline">
                                {day}
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatTime(row.start_time)} - {formatTime(row.end_time)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{row.subject_name || row.subject_code || "Untitled Subject"}</p>
                          {row.subject_code && (
                            <p className="text-xs text-gray-500 mt-0.5">{row.subject_code}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{row.section || "-"}</TableCell>
                      <TableCell>{roomLabel}</TableCell>
                      <TableCell>
                        <div>
                          <p>{row.semester || "-"}</p>
                          <p className="text-xs text-gray-500">{row.academic_year || ""}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
