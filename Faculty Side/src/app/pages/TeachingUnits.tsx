import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { resolveFacultyId } from "../utils/facultySession";

type FacultyLoad = {
  load_id: number;
  subject_code: string | null;
  subject_name: string | null;
  section: string | null;
  semester: string | null;
  academic_year: string | null;
  teaching_units: number | null;
};

export default function TeachingUnits() {
  const { user } = useAuth();
  const [items, setItems] = useState<FacultyLoad[]>([]);
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
      .then((facultyId) => api.get<FacultyLoad[]>(`/faculty/${encodeURIComponent(facultyId)}/load`))
      .then((rows) => {
        if (!isMounted) return;
        setItems(rows || []);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load teaching units.");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const totalUnits = useMemo(
    () => items.reduce((sum, row) => sum + (Number(row.teaching_units) || 0), 0),
    [items]
  );

  const byTerm = useMemo(() => {
    const map = new Map<string, { classes: number; units: number }>();
    items.forEach((row) => {
      const key = `${row.semester || "N/A"} | ${row.academic_year || "N/A"}`;
      const prev = map.get(key) || { classes: 0, units: 0 };
      prev.classes += 1;
      prev.units += Number(row.teaching_units) || 0;
      map.set(key, prev);
    });
    return Array.from(map.entries()).map(([term, stats]) => ({ term, ...stats }));
  }, [items]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Teaching Units</h1>
        <p className="mt-1 text-sm text-gray-500">Teaching-unit totals based on Dean-assigned faculty load.</p>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Teaching Units</p>
            <p className="mt-2 text-3xl font-semibold text-amber-600">{loading ? "..." : totalUnits}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Class Count</p>
            <p className="mt-2 text-3xl font-semibold text-orange-600">{loading ? "..." : items.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Units by Term</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-gray-500">Loading term breakdown...</p>
          ) : byTerm.length === 0 ? (
            <p className="text-sm text-gray-500">No teaching load records found.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-600">
                  <tr>
                    <th className="px-3 py-2">Term</th>
                    <th className="px-3 py-2">Assigned Classes</th>
                    <th className="px-3 py-2">Teaching Units</th>
                  </tr>
                </thead>
                <tbody>
                  {byTerm.map((row) => (
                    <tr key={row.term} className="border-t border-gray-100">
                      <td className="px-3 py-2">{row.term}</td>
                      <td className="px-3 py-2">{row.classes}</td>
                      <td className="px-3 py-2 font-medium">{row.units}</td>
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
