import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { resolveFacultyId } from "../utils/facultySession";

type Schedule = {
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

type FacultyEmployment = {
  assigned_section: string | null;
};

export default function AssignedClasses() {
  const { user } = useAuth();
  const [items, setItems] = useState<Schedule[]>([]);
  const [assignedSection, setAssignedSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    if (!user) {
      setLoading(false);
      setError("No faculty session found.");
      return;
    }

    setLoading(true);
    setError("");

    resolveFacultyId(user)
      .then(async (facultyId) => {
        const [scheduleRows, employment] = await Promise.all([
          api.get<Schedule[]>(`/faculty/${encodeURIComponent(facultyId)}/schedules`).catch(() => []),
          api.get<FacultyEmployment>(`/faculty/${encodeURIComponent(facultyId)}/employment`).catch(() => null),
        ]);

        if (!isMounted) return;
        setItems(scheduleRows);
        setAssignedSection(employment?.assigned_section || null);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load assigned classes.");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const classCount = useMemo(() => items.length, [items]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Assigned Classes</h1>
        <p className="mt-1 text-sm text-gray-500">Classes assigned by the Dean, including section and term details.</p>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Assigned Classes</p>
            <p className="mt-2 text-3xl font-semibold text-orange-600">{loading ? "..." : classCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Default Assigned Section</p>
            <p className="mt-2 text-3xl font-semibold text-amber-600">{loading ? "..." : assignedSection || "N/A"}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Class Assignment List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-gray-500">Loading assigned classes...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-gray-500">No class assignments found.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-600">
                  <tr>
                    <th className="px-3 py-2">Subject Code</th>
                    <th className="px-3 py-2">Subject Name</th>
                    <th className="px-3 py-2">Section</th>
                    <th className="px-3 py-2">Day & Time</th>
                    <th className="px-3 py-2">Room Location</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row) => (
                    <tr key={row.schedule_id} className="border-t border-gray-100">
                      <td className="px-3 py-2 font-medium">{row.subject_code || "-"}</td>
                      <td className="px-3 py-2">{row.subject_name || "-"}</td>
                      <td className="px-3 py-2">
                        <Badge variant="outline">{row.section || assignedSection || "N/A"}</Badge>
                      </td>
                      <td className="px-3 py-2">
                        {row.day_of_week && row.start_time && row.end_time
                          ? `${row.day_of_week} ${row.start_time}-${row.end_time}`
                          : "-"}
                      </td>
                      <td className="px-3 py-2">
                        {row.room_name ? (
                          <>
                            {row.room_name}
                            {row.building ? ` (${row.building})` : ""}
                          </>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
