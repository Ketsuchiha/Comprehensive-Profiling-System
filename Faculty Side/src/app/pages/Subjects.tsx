import { useEffect, useMemo, useState } from "react";
import { BookOpen, Layers, GraduationCap } from "lucide-react";
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

type FacultyLoadRecord = {
  load_id: number;
  subject_code: string | null;
  subject_name: string | null;
  section: string | null;
  semester: string | null;
  academic_year: string | null;
  subject_units: number | null;
  teaching_units: number | null;
};

export default function Subjects() {
  const { user } = useAuth();
  const [records, setRecords] = useState<FacultyLoadRecord[]>([]);
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
      .get<FacultyLoadRecord[]>(`/faculty/${encodeURIComponent(user.refId)}/load`)
      .then((rows) => {
        if (!isMounted) return;
        setRecords(rows);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load assigned subjects.");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user?.refId]);

  const totalUnits = useMemo(
    () => records.reduce((sum, item) => sum + Number(item.subject_units ?? item.teaching_units ?? 0), 0),
    [records]
  );

  const uniqueSubjects = useMemo(() => {
    const set = new Set(records.map((item) => item.subject_code).filter(Boolean));
    return set.size;
  }, [records]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">My Subjects</h1>
        <p className="mt-1 text-sm text-gray-500">
          Subjects currently assigned to your teaching load.
        </p>
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
                <p className="text-sm text-gray-600">Load Entries</p>
                <p className="mt-1 text-3xl font-semibold text-orange-600">{records.length}</p>
              </div>
              <Layers className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-600">Unique Subjects</p>
                <p className="mt-1 text-3xl font-semibold text-amber-600">{uniqueSubjects}</p>
              </div>
              <BookOpen className="h-6 w-6 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-600">Teaching Units</p>
                <p className="mt-1 text-3xl font-semibold text-orange-600">{totalUnits}</p>
              </div>
              <GraduationCap className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white">
        <CardHeader className="border-b border-gray-100">
          <CardTitle>Assigned Subject List</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-sm text-gray-500">Loading subject assignments...</p>
          ) : records.length === 0 ? (
            <p className="text-sm text-gray-500">No assigned subjects found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Subject</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead className="text-right">Units</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((item) => (
                  <TableRow key={item.load_id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{item.subject_name || item.subject_code || "Untitled Subject"}</p>
                        {item.subject_code && (
                          <Badge variant="outline" className="mt-1">{item.subject_code}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.section || "-"}</TableCell>
                    <TableCell>{item.semester || "-"}</TableCell>
                    <TableCell>{item.academic_year || "-"}</TableCell>
                    <TableCell className="text-right">{item.subject_units ?? item.teaching_units ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
