import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { resolveFacultyId } from "../utils/facultySession";

type FacultyResearch = {
  research_id: number;
  research_title: string | null;
  publication_type: string | null;
  year_published: number | null;
  status: string | null;
};

export default function ResearchOutputs() {
  const { user } = useAuth();
  const [items, setItems] = useState<FacultyResearch[]>([]);
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
      .then((facultyId) => api.get<FacultyResearch[]>(`/faculty/${encodeURIComponent(facultyId)}/research`))
      .then((rows) => {
        if (!isMounted) return;
        setItems(rows || []);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load research outputs.");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const publishedCount = useMemo(
    () => items.filter((row) => (row.status || "").toLowerCase().includes("publish")).length,
    [items]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Research Outputs</h1>
        <p className="mt-1 text-sm text-gray-500">Research records assigned to your faculty profile by the Dean/Admin team.</p>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Research Outputs</p>
            <p className="mt-2 text-3xl font-semibold text-orange-600">{loading ? "..." : items.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Published Outputs</p>
            <p className="mt-2 text-3xl font-semibold text-amber-600">{loading ? "..." : publishedCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Research Output List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-gray-500">Loading research outputs...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-gray-500">No research outputs found.</p>
          ) : (
            <div className="space-y-3">
              {items.map((row) => (
                <div key={row.research_id} className="rounded-lg border border-gray-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">{row.research_title || "Untitled Research"}</p>
                      <p className="mt-1 text-sm text-gray-600">
                        {row.publication_type || "Publication type not set"}
                        {row.year_published ? ` • ${row.year_published}` : ""}
                      </p>
                    </div>
                    <Badge variant="outline">{row.status || "Status N/A"}</Badge>
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
