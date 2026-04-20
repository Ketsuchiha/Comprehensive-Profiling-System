import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { resolveFacultyId } from "../utils/facultySession";

type SyllabusRow = {
  syllabus_id: number;
  subject_code: string | null;
  subject_name: string | null;
  faculty_id: string | null;
  semester: string | null;
  academic_year: string | null;
  is_approved: number | null;
  created_at: string | null;
};

export default function AuthoredSyllabi() {
  const { user } = useAuth();
  const [items, setItems] = useState<SyllabusRow[]>([]);
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
        const rows = await api.get<SyllabusRow[]>("/instruments/syllabus");
        if (!isMounted) return;
        setItems((rows || []).filter((row) => row.faculty_id === facultyId));
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load authored syllabi.");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const approvedCount = useMemo(
    () => items.filter((row) => Number(row.is_approved) === 1).length,
    [items]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Authored Syllabi</h1>
        <p className="mt-1 text-sm text-gray-500">Syllabi/modules assigned to your faculty account by the Dean/Admin side.</p>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Authored Syllabi</p>
            <p className="mt-2 text-3xl font-semibold text-orange-600">{loading ? "..." : items.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Approved Syllabi</p>
            <p className="mt-2 text-3xl font-semibold text-amber-600">{loading ? "..." : approvedCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Syllabus/Module List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-gray-500">Loading syllabi...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-gray-500">No authored syllabi found.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-600">
                  <tr>
                    <th className="px-3 py-2">Syllabus ID</th>
                    <th className="px-3 py-2">Subject Code</th>
                    <th className="px-3 py-2">Subject Name</th>
                    <th className="px-3 py-2">Term</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row) => (
                    <tr key={row.syllabus_id} className="border-t border-gray-100">
                      <td className="px-3 py-2">{row.syllabus_id}</td>
                      <td className="px-3 py-2">{row.subject_code || "-"}</td>
                      <td className="px-3 py-2">{row.subject_name || "-"}</td>
                      <td className="px-3 py-2">{`${row.semester || "N/A"} | ${row.academic_year || "N/A"}`}</td>
                      <td className="px-3 py-2">
                        <Badge variant="outline">{Number(row.is_approved) === 1 ? "Approved" : "Draft"}</Badge>
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
