import { useEffect, useMemo, useState } from "react";
import { Mail, Phone, MapPin, Briefcase, Award, UserRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";

type FacultyEducation = {
  edu_id: number;
  degree: string | null;
  institution: string | null;
  year_graduated: number | null;
};

type FacultyLoad = {
  load_id: number;
  subject_code: string | null;
  subject_name: string | null;
  section: string | null;
  semester: string | null;
  academic_year: string | null;
  teaching_units: number | null;
};

type FacultyEvaluation = {
  eval_id: number;
  semester: string | null;
  academic_year: string | null;
  student_eval_score: number | null;
  peer_eval_score: number | null;
};

type FacultyResearch = {
  research_id: number;
  research_title: string | null;
  publication_type: string | null;
  year_published: number | null;
  status: string | null;
};

type FacultyCertification = {
  cert_id: number;
  certificate_name: string | null;
  certificate_file: string | null;
  mime_type: string | null;
  uploaded_at: string | null;
};

type FacultyRecord = {
  faculty_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  birth_date: string | null;
  gender: string | null;
  email: string | null;
  contact_no: string | null;
  address: string | null;
  profile_photo: string | null;
  specialization: string | null;
  age: number | null;
  work_experience_years: number | null;
  expertise_certificate_path: string | null;
  employment: {
    employment_status: string | null;
    rank: string | null;
    department_id: number | null;
    dept_name: string | null;
    date_hired: string | null;
    tenure_status: string | null;
  } | null;
  education: FacultyEducation[];
  load: FacultyLoad[];
  evaluations: FacultyEvaluation[];
  research: FacultyResearch[];
  certifications: FacultyCertification[];
};

const fallbackProfilePhoto =
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

export default function Profile() {
  const { user } = useAuth();
  const [faculty, setFaculty] = useState<FacultyRecord | null>(null);
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
      .get<FacultyRecord>(`/faculty/${encodeURIComponent(user.refId)}`)
      .then((data) => {
        if (!isMounted) return;
        setFaculty(data);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load faculty profile.");
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
    if (!faculty) return user?.name || "Faculty";
    return [faculty.first_name, faculty.middle_name, faculty.last_name].filter(Boolean).join(" ");
  }, [faculty, user?.name]);

  if (loading) {
    return (
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900">Faculty Module</h1>
        <p className="text-sm text-gray-500">Loading your profile...</p>
      </div>
    );
  }

  if (error || !faculty) {
    return (
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900">Faculty Module</h1>
        <p className="text-sm text-red-600">{error || "Faculty profile not found."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Faculty Module</h1>
        <p className="mt-1 text-sm text-gray-500">Data below is mapped from admin-maintained tables in the backend database.</p>
      </div>

      <Card className="bg-white">
        <CardHeader className="border-b border-gray-100">
          <CardTitle>Faculty Profile Mapping</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <img
              src={faculty.profile_photo || fallbackProfilePhoto}
              alt="Faculty profile"
              className="h-32 w-32 rounded-full object-cover border-4 border-gray-100 shadow-sm"
            />
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-semibold text-gray-900">{fullName}</h2>
              <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">{faculty.faculty_id}</Badge>
                <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                  {faculty.employment?.employment_status || "Active"}
                </Badge>
                {faculty.specialization && <Badge variant="outline">{faculty.specialization}</Badge>}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Faculty ID</p>
              <p className="mt-1 font-medium text-gray-900">{faculty.faculty_id}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">First Name</p>
              <p className="mt-1 font-medium text-gray-900">{faculty.first_name || "-"}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Middle Name</p>
              <p className="mt-1 font-medium text-gray-900">{faculty.middle_name || "-"}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Last Name</p>
              <p className="mt-1 font-medium text-gray-900">{faculty.last_name || "-"}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Date of Birth</p>
              <p className="mt-1 font-medium text-gray-900">{faculty.birth_date ? new Date(faculty.birth_date).toLocaleDateString() : "-"}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Gender</p>
              <p className="mt-1 font-medium text-gray-900">{faculty.gender || "-"}</p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-500">
                <Mail className="h-3 w-3" /> Email
              </p>
              <p className="mt-1 font-medium text-gray-900">{faculty.email || "-"}</p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-500">
                <Phone className="h-3 w-3" /> Contact Number
              </p>
              <p className="mt-1 font-medium text-gray-900">{faculty.contact_no || "-"}</p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 sm:col-span-2 lg:col-span-1">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-500">
                <MapPin className="h-3 w-3" /> Address
              </p>
              <p className="mt-1 font-medium text-gray-900">{faculty.address || "-"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader className="border-b border-gray-100">
          <CardTitle>Employment Profile Mapping</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-orange-100 bg-orange-50 p-4">
              <p className="text-xs uppercase tracking-wide text-orange-700">Employment Status</p>
              <p className="mt-1 font-medium text-gray-900">{faculty.employment?.employment_status || "-"}</p>
            </div>
            <div className="rounded-lg border border-orange-100 bg-orange-50 p-4">
              <p className="text-xs uppercase tracking-wide text-orange-700">Academic Rank</p>
              <p className="mt-1 font-medium text-gray-900">{faculty.employment?.rank || "-"}</p>
            </div>
            <div className="rounded-lg border border-orange-100 bg-orange-50 p-4">
              <p className="text-xs uppercase tracking-wide text-orange-700">Department</p>
              <p className="mt-1 font-medium text-gray-900">{faculty.employment?.dept_name || "-"}</p>
            </div>
            <div className="rounded-lg border border-orange-100 bg-orange-50 p-4">
              <p className="text-xs uppercase tracking-wide text-orange-700">Date Hired</p>
              <p className="mt-1 font-medium text-gray-900">
                {faculty.employment?.date_hired ? new Date(faculty.employment.date_hired).toLocaleDateString() : "-"}
              </p>
            </div>
            <div className="rounded-lg border border-orange-100 bg-orange-50 p-4">
              <p className="text-xs uppercase tracking-wide text-orange-700">Tenure Status</p>
              <p className="mt-1 font-medium text-gray-900">{faculty.employment?.tenure_status || "-"}</p>
            </div>
            <div className="rounded-lg border border-orange-100 bg-orange-50 p-4">
              <p className="text-xs uppercase tracking-wide text-orange-700">Work Experience</p>
              <p className="mt-1 font-medium text-gray-900">{faculty.work_experience_years ?? 0} years</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader className="border-b border-gray-100">
          <CardTitle>Educational Background Mapping</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-3 py-2">Degree</th>
                  <th className="px-3 py-2">School</th>
                  <th className="px-3 py-2">Year Graduated</th>
                </tr>
              </thead>
              <tbody>
                {faculty.education.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-3 text-gray-500">No educational background records.</td>
                  </tr>
                )}
                {faculty.education.map((item) => (
                  <tr key={item.edu_id} className="border-t border-gray-100">
                    <td className="px-3 py-2">{item.degree || "-"}</td>
                    <td className="px-3 py-2">{item.institution || "-"}</td>
                    <td className="px-3 py-2">{item.year_graduated || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
            <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-amber-700">
              <Award className="h-3 w-3" /> Certifications
            </p>
            {faculty.certifications.length === 0 ? (
              <p className="mt-2 text-sm text-gray-700">No certifications uploaded.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {faculty.certifications.map((cert) => (
                  <li key={cert.cert_id} className="text-sm text-gray-700">
                    <span className="font-medium">{cert.certificate_name || "Certification"}</span>
                    {cert.certificate_file && (
                      <>
                        {" "}
                        <a href={cert.certificate_file} target="_blank" rel="noreferrer" className="text-orange-700 hover:text-orange-800">
                          View file
                        </a>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader className="border-b border-gray-100">
          <CardTitle>Teaching Profile Mapping</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-3 py-2">Subject Code</th>
                  <th className="px-3 py-2">Subject</th>
                  <th className="px-3 py-2">Section</th>
                  <th className="px-3 py-2">Semester</th>
                  <th className="px-3 py-2">Academic Year</th>
                  <th className="px-3 py-2">Teaching Units</th>
                </tr>
              </thead>
              <tbody>
                {faculty.load.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-3 text-gray-500">No teaching load records.</td>
                  </tr>
                )}
                {faculty.load.map((item) => (
                  <tr key={item.load_id} className="border-t border-gray-100">
                    <td className="px-3 py-2">{item.subject_code || "-"}</td>
                    <td className="px-3 py-2">{item.subject_name || "-"}</td>
                    <td className="px-3 py-2">{item.section || "-"}</td>
                    <td className="px-3 py-2">{item.semester || "-"}</td>
                    <td className="px-3 py-2">{item.academic_year || "-"}</td>
                    <td className="px-3 py-2">{item.teaching_units ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader className="border-b border-gray-100">
          <CardTitle>Performance and Research Mapping</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-3 py-2">Semester</th>
                  <th className="px-3 py-2">Academic Year</th>
                  <th className="px-3 py-2">Student Evaluation Score</th>
                  <th className="px-3 py-2">Peer Evaluation Score</th>
                </tr>
              </thead>
              <tbody>
                {faculty.evaluations.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-3 text-gray-500">No evaluation records.</td>
                  </tr>
                )}
                {faculty.evaluations.map((item) => (
                  <tr key={item.eval_id} className="border-t border-gray-100">
                    <td className="px-3 py-2">{item.semester || "-"}</td>
                    <td className="px-3 py-2">{item.academic_year || "-"}</td>
                    <td className="px-3 py-2">{item.student_eval_score ?? "-"}</td>
                    <td className="px-3 py-2">{item.peer_eval_score ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-3 py-2">Research Title</th>
                  <th className="px-3 py-2">Publication Type</th>
                  <th className="px-3 py-2">Year</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {faculty.research.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-3 text-gray-500">No research records.</td>
                  </tr>
                )}
                {faculty.research.map((item) => (
                  <tr key={item.research_id} className="border-t border-gray-100">
                    <td className="px-3 py-2">{item.research_title || "-"}</td>
                    <td className="px-3 py-2">{item.publication_type || "-"}</td>
                    <td className="px-3 py-2">{item.year_published || "-"}</td>
                    <td className="px-3 py-2">{item.status || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader className="border-b border-gray-100">
          <CardTitle>Account Reference</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-500">
              <UserRound className="h-3 w-3" /> Session Faculty ID
            </p>
            <p className="mt-1 font-medium text-gray-900">{user?.refId || faculty.faculty_id}</p>
          </div>
          <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
            <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-500">
              <Briefcase className="h-3 w-3" /> Validation Snapshot
            </p>
            <p className="mt-1 text-sm text-gray-700">
              Required profile fields are sourced from table faculty and linked tables: faculty_employment, faculty_education,
              faculty_load, faculty_evaluation, faculty_research, and faculty_expertise_certifications.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
