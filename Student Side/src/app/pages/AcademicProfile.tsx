import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { GraduationCap, BookOpen, Award, Calendar, TrendingUp, Users } from "lucide-react";
import { Badge } from "../components/ui/badge";

const mockAcademicProfile = {
  program: "Bachelor of Science in Computer Science",
  major: "Software Engineering",
  yearLevel: "3rd Year",
  section: "CS-3A",
  scholarshipType: "Academic Excellence Scholarship",
  enrollmentStatus: "Regular",
  dateAdmitted: "August 15, 2023",
};

export default function AcademicProfile() {
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
                <p className="text-xl font-semibold text-blue-900 mt-0.5">2nd Semester</p>
                <p className="text-xs text-blue-600 mt-0.5">A.Y. 2025-2026</p>
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
                <p className="text-xl font-semibold text-green-900 mt-0.5">21 Units</p>
                <p className="text-xs text-green-600 mt-0.5">7 Subjects</p>
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
                <p className="text-xl font-semibold text-purple-900 mt-0.5">3.75</p>
                <p className="text-xs text-purple-600 mt-0.5">Dean's List</p>
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
                  <p className="text-gray-900 font-medium">{mockAcademicProfile.program}</p>
                </div>

                <div className="space-y-2 p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <label className="text-xs uppercase tracking-wide font-medium text-gray-500">Major</label>
                  <p className="text-gray-900 font-medium">{mockAcademicProfile.major}</p>
                </div>

                <div className="space-y-2 p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <label className="text-xs uppercase tracking-wide font-medium text-gray-500">
                    Year Level
                  </label>
                  <p className="text-gray-900 font-medium">{mockAcademicProfile.yearLevel}</p>
                </div>

                <div className="space-y-2 p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <label className="text-xs uppercase tracking-wide font-medium text-gray-500 flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Section
                  </label>
                  <p className="text-gray-900 font-medium">{mockAcademicProfile.section}</p>
                </div>

                <div className="space-y-2 p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <label className="text-xs uppercase tracking-wide font-medium text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Date Admitted
                  </label>
                  <p className="text-gray-900 font-medium">{mockAcademicProfile.dateAdmitted}</p>
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
                  <p className="text-gray-900 font-medium">{mockAcademicProfile.scholarshipType}</p>
                </div>

                <div className="space-y-2 p-4 rounded-lg bg-green-50 border border-green-100">
                  <label className="text-xs uppercase tracking-wide font-medium text-green-700">
                    Enrollment Status
                  </label>
                  <div className="mt-2">
                    <Badge
                      variant="outline"
                      className={getEnrollmentStatusColor(
                        mockAcademicProfile.enrollmentStatus
                      )}
                    >
                      {mockAcademicProfile.enrollmentStatus}
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