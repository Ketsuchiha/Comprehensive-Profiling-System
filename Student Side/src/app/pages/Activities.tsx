import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Users, Briefcase, Clock, Award } from "lucide-react";
import { Badge } from "../components/ui/badge";

const mockOrganizations = [
  {
    id: 1,
    organizationName: "Computer Science Society",
    position: "Vice President",
    joinedDate: "August 2024",
    status: "Active",
  },
  {
    id: 2,
    organizationName: "Google Developer Student Club",
    position: "Technical Lead",
    joinedDate: "September 2024",
    status: "Active",
  },
  {
    id: 3,
    organizationName: "Association of Computing Machinery",
    position: "Member",
    joinedDate: "August 2023",
    status: "Active",
  },
];

const mockInternships = [
  {
    id: 1,
    company: "Tech Solutions Inc.",
    position: "Software Development Intern",
    startDate: "June 2025",
    endDate: "August 2025",
    totalHours: 480,
    status: "Completed",
  },
  {
    id: 2,
    company: "Digital Innovations Corp.",
    position: "Web Development Intern",
    startDate: "December 2025",
    endDate: "February 2026",
    totalHours: 320,
    status: "Ongoing",
  },
];

const mockAchievements = [
  {
    id: 1,
    title: "Dean's Lister",
    description: "Achieved Dean's List recognition for 4 consecutive semesters",
    date: "2023-2026",
  },
  {
    id: 2,
    title: "Hackathon Winner",
    description: "1st Place - University Hackathon 2025",
    date: "March 2025",
  },
  {
    id: 3,
    title: "Academic Excellence Award",
    description: "Outstanding performance in Computer Science",
    date: "May 2025",
  },
];

export default function Activities() {
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

  const totalInternshipHours = mockInternships.reduce(
    (sum, internship) => sum + internship.totalHours,
    0
  );

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
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-700 font-medium">Organizations</p>
                <p className="text-2xl font-semibold text-blue-900 mt-0.5">
                  {mockOrganizations.length}
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
                  {mockInternships.length}
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
      </div>

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
          <div className="space-y-3">
            {mockOrganizations.map((org) => (
              <div
                key={org.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-all bg-gray-50"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {org.organizationName}
                  </h4>
                  <p className="text-sm text-blue-600 font-medium mt-1">{org.position}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Joined: {org.joinedDate}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`mt-3 sm:mt-0 ${getStatusColor(org.status)} w-fit`}
                >
                  {org.status}
                </Badge>
              </div>
            ))}
          </div>
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
          <div className="space-y-3">
            {mockInternships.map((internship) => (
              <div
                key={internship.id}
                className="p-4 border rounded-lg hover:shadow-sm transition-all bg-gray-50"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {internship.company}
                        </h4>
                        <p className="text-sm text-purple-600 font-medium mt-1">
                          {internship.position}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-3 text-xs">
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-gray-200">
                        <Clock className="h-3 w-3 text-gray-600" />
                        <span className="font-medium text-gray-700">{internship.totalHours} hours</span>
                      </span>
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-gray-200">
                        <span className="font-medium text-gray-700">
                          {internship.startDate} - {internship.endDate}
                        </span>
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={getStatusColor(internship.status)}
                  >
                    {internship.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="bg-white">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Award className="h-4 w-4 text-yellow-600" />
            </div>
            <CardTitle>Achievements & Recognition</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {mockAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-sm transition-all bg-gradient-to-br from-yellow-50 to-orange-50"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shadow-md">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {achievement.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {achievement.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-2 font-medium">
                    {achievement.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}