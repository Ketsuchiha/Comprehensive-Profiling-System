import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { BookOpen, TrendingUp, Award } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useEffect, useMemo, useState } from "react";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";

type GradeRecord = {
  subject_code: string;
  subject_name: string | null;
  semester: string | null;
  academic_year: string | null;
  final_grade: number | null;
};

type ViewGrade = {
  subjectCode: string;
  subjectName: string;
  semester: string;
  academicYear: string;
  finalGrade: number;
};

const calculateGPA = (records: ViewGrade[]) => {
  if (records.length === 0) return 0;
  const sum = records.reduce((acc, record) => acc + record.finalGrade, 0);
  return (sum / records.length).toFixed(2);
};

const getGradeColor = (grade: number) => {
  if (grade <= 1.25) return "text-green-600 font-semibold";
  if (grade <= 1.75) return "text-blue-600 font-semibold";
  if (grade <= 2.50) return "text-yellow-600 font-semibold";
  return "text-orange-600 font-semibold";
};

const groupByAcademicYear = (records: ViewGrade[]) => {
  const grouped: { [key: string]: ViewGrade[] } = {};
  records.forEach((record) => {
    if (!grouped[record.academicYear]) {
      grouped[record.academicYear] = [];
    }
    grouped[record.academicYear].push(record);
  });
  return grouped;
};

export default function AcademicRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState<ViewGrade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.refId) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    api
      .get<GradeRecord[]>(`/students/${encodeURIComponent(user.refId)}/grades`)
      .then((rows) => {
        if (!isMounted) return;
        const normalized = rows
          .filter((row) => typeof row.final_grade === "number")
          .map((row) => ({
            subjectCode: row.subject_code,
            subjectName: row.subject_name || row.subject_code,
            semester: row.semester || "N/A",
            academicYear: row.academic_year || "Unknown",
            finalGrade: Number(row.final_grade),
          }));
        setRecords(normalized);
      })
      .catch(() => {
        if (!isMounted) return;
        setRecords([]);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user?.refId]);

  const groupedRecords = useMemo(() => groupByAcademicYear(records), [records]);
  const overallGPA = calculateGPA(records);
  const tabYears = useMemo(() => Object.keys(groupedRecords).sort().reverse(), [groupedRecords]);
  const defaultYear = tabYears[0] || "empty";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Academic Records</h1>
        <p className="mt-1 text-sm text-gray-500">Your complete academic history and grades.</p>
      </div>

      {/* GPA Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-700 font-medium">Total Subjects</p>
                <p className="text-2xl font-semibold text-blue-900 mt-0.5">
                  {records.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-700 font-medium">Overall GPA</p>
                <p className="text-2xl font-semibold text-green-900 mt-0.5">{overallGPA}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-purple-700 font-medium">Academic Standing</p>
                <p className="text-lg font-semibold text-purple-900 mt-0.5">{records.length ? "Recorded" : "No records"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Academic Records Table */}
      <Card className="bg-white">
        <CardHeader className="border-b border-gray-100">
          <CardTitle>Grade Records</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-sm text-gray-500">Loading academic records...</p>
          ) : records.length === 0 ? (
            <p className="text-sm text-gray-500">No academic records available yet.</p>
          ) : (
          <Tabs defaultValue={defaultYear}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              {tabYears.map((year) => (
                <TabsTrigger key={year} value={year} className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  A.Y. {year}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(groupedRecords).map(([year, records]) => {
              // Group by semester within each academic year
              const firstSem = records.filter(r => r.semester === "1st Semester");
              const secondSem = records.filter(r => r.semester === "2nd Semester");
              const yearGPA = calculateGPA(records);

              return (
                <TabsContent key={year} value={year} className="space-y-6 mt-0">
                  {/* First Semester */}
                  {firstSem.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
                        <h3 className="font-semibold text-blue-900">1st Semester</h3>
                        <Badge className="bg-blue-600 text-white hover:bg-blue-700">
                          GPA: {calculateGPA(firstSem)}
                        </Badge>
                      </div>
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead className="font-semibold">Subject Code</TableHead>
                              <TableHead className="font-semibold">Subject Name</TableHead>
                              <TableHead className="text-right font-semibold">Final Grade</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {firstSem.map((record, index) => (
                              <TableRow key={index} className="hover:bg-gray-50">
                                <TableCell className="font-medium">
                                  {record.subjectCode}
                                </TableCell>
                                <TableCell>{record.subjectName}</TableCell>
                                <TableCell className={`text-right ${getGradeColor(record.finalGrade)}`}>
                                  {record.finalGrade.toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {/* Second Semester */}
                  {secondSem.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-4 py-2 bg-purple-50 rounded-lg border border-purple-100">
                        <h3 className="font-semibold text-purple-900">2nd Semester</h3>
                        <Badge className="bg-purple-600 text-white hover:bg-purple-700">
                          GPA: {calculateGPA(secondSem)}
                        </Badge>
                      </div>
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead className="font-semibold">Subject Code</TableHead>
                              <TableHead className="font-semibold">Subject Name</TableHead>
                              <TableHead className="text-right font-semibold">Final Grade</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {secondSem.map((record, index) => (
                              <TableRow key={index} className="hover:bg-gray-50">
                                <TableCell className="font-medium">
                                  {record.subjectCode}
                                </TableCell>
                                <TableCell>{record.subjectName}</TableCell>
                                <TableCell className={`text-right ${getGradeColor(record.finalGrade)}`}>
                                  {record.finalGrade.toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {/* Year Summary */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">
                        Academic Year {year} GPA
                      </span>
                      <span className="text-2xl font-semibold text-blue-600">
                        {yearGPA}
                      </span>
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}