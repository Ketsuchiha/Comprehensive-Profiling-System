import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { GraduationCap, BookOpen, Award, Calendar, TrendingUp, Users } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { useEffect, useMemo, useState } from "react";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";

type AcademicRecord = {
  program: string | null;
  major: string | null;
  track: string | null;
  year_level: number | null;
  section: string | null;
  scholarship_type: string | null;
  enrollment_status: string | null;
  admission_date: string | null;
};

type CourseRecord = {
  subject_code: string;
};

type GradeRecord = {
  final_grade: number | null;
};

export default function AcademicProfile() {
  const { user } = useAuth();
  const [academic, setAcademic] = useState<AcademicRecord | null>(null);
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.refId) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    Promise.all([
      api.get<AcademicRecord>(`/students/${encodeURIComponent(user.refId)}/academic`).catch(() => null),
      api.get<CourseRecord[]>(`/students/${encodeURIComponent(user.refId)}/courses`).catch(() => []),
      api.get<GradeRecord[]>(`/students/${encodeURIComponent(user.refId)}/grades`).catch(() => []),
    ])
      .then(([academicData, courseData, gradeData]) => {
        if (!isMounted) return;
        setAcademic(academicData);
        setCourses(courseData);
        setGrades(gradeData);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user?.refId]);

  const cumulativeGpa = useMemo(() => {
    const validGrades = grades.filter((g) => typeof g.final_grade === "number") as Array<{ final_grade: number }>;
    if (validGrades.length === 0) return "-";
    const avg = validGrades.reduce((sum, g) => sum + g.final_grade, 0) / validGrades.length;
    return avg.toFixed(2);
  }, [grades]);

  const yearLevelLabel = academic?.year_level ? `${academic.year_level}${academic.year_level === 1 ? "st" : academic.year_level === 2 ? "nd" : academic.year_level === 3 ? "rd" : "th"} Year` : "-";
  const admissionDateLabel = academic?.admission_date
    ? new Date(academic.admission_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "-";

  const getEnrollmentStatusColor = (status: string) => {
    switch (status) {
      case "Regular":
        return "bg-green-100 text-green-700 border-green-200 hover:bg-green-100";
      case "Irregular":
        return "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100";
      case "LOA":
        return "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Academic Profile</h1>
        <p className="mt-1 text-sm text-gray-500">Your academic information and enrollment details.</p>
      </div>

      {/* Academic Standing Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-700 font-medium">Current Semester</p>
                <p className="text-xl font-semibold text-blue-900 mt-0.5">{loading ? "Loading..." : "Active"}</p>
                <p className="text-xs text-blue-600 mt-0.5">{academic?.enrollment_status || "No status yet"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-700 font-medium">Units Enrolled</p>
                <p className="text-xl font-semibold text-green-900 mt-0.5">{courses.length * 3} Units</p>
                <p className="text-xs text-green-600 mt-0.5">{courses.length} Subjects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-purple-700 font-medium">Cumulative GPA</p>
                <p className="text-xl font-semibold text-purple-900 mt-0.5">{cumulativeGpa}</p>
                <p className="text-xs text-purple-600 mt-0.5">{grades.length > 0 ? "Based on recorded grades" : "No grades yet"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-blue-600" />
            </div>
            <CardTitle>Academic Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-8">
            {/* Program Information */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Program Details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 p-4 rounded-lg bg-blue-50 border border-blue-100">
                  <label className="text-xs uppercase tracking-wide font-medium text-blue-600 flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    Program
                  </label>
                  <p className="text-gray-900 font-medium">{academic?.program || "-"}</p>
                </div>

                <div className="space-y-2 p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <label className="text-xs uppercase tracking-wide font-medium text-gray-500">Major</label>
                  <p className="text-gray-900 font-medium">{academic?.major || academic?.track || "-"}</p>
                </div>

                <div className="space-y-2 p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <label className="text-xs uppercase tracking-wide font-medium text-gray-500">
                    Year Level
                  </label>
                  <p className="text-gray-900 font-medium">{yearLevelLabel}</p>
                </div>

                <div className="space-y-2 p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <label className="text-xs uppercase tracking-wide font-medium text-gray-500 flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Section
                  </label>
                  <p className="text-gray-900 font-medium">{academic?.section || "-"}</p>
                </div>

                <div className="space-y-2 p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <label className="text-xs uppercase tracking-wide font-medium text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Date Admitted
                  </label>
                  <p className="text-gray-900 font-medium">{admissionDateLabel}</p>
                </div>
              </div>
            </div>

            {/* Scholarship and Status */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Enrollment Status</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 p-4 rounded-lg bg-yellow-50 border border-yellow-100">
                  <label className="text-xs uppercase tracking-wide font-medium text-yellow-700 flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    Scholarship Type
                  </label>
                  <p className="text-gray-900 font-medium">{academic?.scholarship_type || "-"}</p>
                </div>

                <div className="space-y-2 p-4 rounded-lg bg-green-50 border border-green-100">
                  <label className="text-xs uppercase tracking-wide font-medium text-green-700">
                    Enrollment Status
                  </label>
                  <div className="mt-2">
                    <Badge
                      variant="outline"
                      className={getEnrollmentStatusColor(
                        academic?.enrollment_status || "Unknown"
                      )}
                    >
                      {academic?.enrollment_status || "Unknown"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}