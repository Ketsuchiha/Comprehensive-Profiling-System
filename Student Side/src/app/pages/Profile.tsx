import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { User, Mail, Phone, MapPin, AlertCircle, Camera } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { useEffect, useMemo, useState } from "react";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";

type StudentRecord = {
  student_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  sex: string | null;
  nationality: string | null;
  contact_number: string | null;
  email: string | null;
  address: string | null;
  emergency_contact: string | null;
  emergency_contact_num: string | null;
  profile_photo: string | null;
};

const fallbackProfilePhoto = "https://images.unsplash.com/photo-1600178572204-6ac8886aae63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBzdHVkZW50JTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyNDUzNjY0fDA&ixlib=rb-4.1.0&q=80&w=1080";

export default function Profile() {
  const { user } = useAuth();
  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.refId) {
      setLoading(false);
      setError("No student ID found for this session.");
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError("");

    api
      .get<StudentRecord>(`/students/${encodeURIComponent(user.refId)}`)
      .then((data) => {
        if (!isMounted) return;
        setStudent(data);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load student profile.");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user?.refId]);

  const fullName = useMemo(() => {
    if (!student) return user?.name || "Student";
    return [student.first_name, student.middle_name, student.last_name].filter(Boolean).join(" ");
  }, [student, user?.name]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Student Profile</h1>
          <p className="mt-1 text-sm text-gray-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Student Profile</h1>
          <p className="mt-1 text-sm text-red-600">{error || "Student profile not found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Student Profile</h1>
        <p className="mt-1 text-sm text-gray-500">Your personal information and details.</p>
      </div>

      <Card className="bg-white">
        <CardHeader className="border-b border-gray-100">
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-8">
            {/* Profile Photo and Basic Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative">
                <img
                  src={student.profile_photo || fallbackProfilePhoto}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 shadow-sm"
                />
                <button
                  type="button"
                  aria-label="Change profile photo"
                  title="Change profile photo"
                  className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors"
                >
                  <Camera className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-semibold text-gray-900">{fullName}</h2>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">
                    {student.student_id}
                  </Badge>
                  <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                    Active Student
                  </Badge>
                </div>
              </div>
            </div>

            {/* Personal Details Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2 p-4 rounded-lg bg-gray-50">
                <label className="text-xs uppercase tracking-wide font-medium text-gray-500">
                  Student ID
                </label>
                <p className="text-gray-900 font-medium">{student.student_id}</p>
              </div>

              <div className="space-y-2 p-4 rounded-lg bg-gray-50">
                <label className="text-xs uppercase tracking-wide font-medium text-gray-500">
                  First Name
                </label>
                <p className="text-gray-900 font-medium">{student.first_name || "-"}</p>
              </div>

              <div className="space-y-2 p-4 rounded-lg bg-gray-50">
                <label className="text-xs uppercase tracking-wide font-medium text-gray-500">
                  Middle Name
                </label>
                <p className="text-gray-900 font-medium">{student.middle_name || "-"}</p>
              </div>

              <div className="space-y-2 p-4 rounded-lg bg-gray-50">
                <label className="text-xs uppercase tracking-wide font-medium text-gray-500">
                  Last Name
                </label>
                <p className="text-gray-900 font-medium">{student.last_name || "-"}</p>
              </div>

              <div className="space-y-2 p-4 rounded-lg bg-gray-50">
                <label className="text-xs uppercase tracking-wide font-medium text-gray-500">Sex</label>
                <p className="text-gray-900 font-medium">{student.sex || "-"}</p>
              </div>

              <div className="space-y-2 p-4 rounded-lg bg-gray-50">
                <label className="text-xs uppercase tracking-wide font-medium text-gray-500">
                  Nationality
                </label>
                <p className="text-gray-900 font-medium">{student.nationality || "-"}</p>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Contact Information</h3>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2 p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <label className="text-xs uppercase tracking-wide font-medium text-gray-500 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Contact Number
                  </label>
                  <p className="text-gray-900 font-medium">{student.contact_number || "-"}</p>
                </div>

                <div className="space-y-2 p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <label className="text-xs uppercase tracking-wide font-medium text-gray-500 flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email Address
                  </label>
                  <p className="text-gray-900 font-medium">{student.email || "-"}</p>
                </div>

                <div className="space-y-2 p-4 rounded-lg bg-gray-50 border border-gray-100 sm:col-span-2">
                  <label className="text-xs uppercase tracking-wide font-medium text-gray-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Address
                  </label>
                  <p className="text-gray-900 font-medium">{student.address || "-"}</p>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Emergency Contact</h3>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2 p-4 rounded-lg bg-red-50 border border-red-100">
                  <label className="text-xs uppercase tracking-wide font-medium text-red-600">
                    Emergency Contact Person
                  </label>
                  <p className="text-gray-900 font-medium">{student.emergency_contact || "-"}</p>
                </div>

                <div className="space-y-2 p-4 rounded-lg bg-red-50 border border-red-100">
                  <label className="text-xs uppercase tracking-wide font-medium text-red-600">
                    Emergency Number
                  </label>
                  <p className="text-gray-900 font-medium">{student.emergency_contact_num || "-"}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}