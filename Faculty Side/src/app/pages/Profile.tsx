import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Mail, Phone, MapPin, Briefcase, Award, UserRound, KeyRound, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { api } from "../utils/api";
import { resolveFacultyId } from "../utils/facultySession";
import { useAuth } from "../context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

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
  const location = useLocation();
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState<FacultyRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setError("No faculty ID found for this session.");
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError("");

    resolveFacultyId(user)
      .then((facultyId) => api.get<FacultyRecord>(`/faculty/${encodeURIComponent(facultyId)}`))
      .then((data) => {
        if (!isMounted) return;
        setFaculty({
          ...data,
          education: Array.isArray(data.education) ? data.education : [],
          load: Array.isArray(data.load) ? data.load : [],
          evaluations: Array.isArray(data.evaluations) ? data.evaluations : [],
          research: Array.isArray(data.research) ? data.research : [],
          certifications: Array.isArray(data.certifications) ? data.certifications : [],
        });
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
  }, [user]);

  const fullName = useMemo(() => {
    if (!faculty) return user?.name || "Faculty";
    return [faculty.first_name, faculty.middle_name, faculty.last_name].filter(Boolean).join(" ");
  }, [faculty, user?.name]);

  const openPasswordModal = () => {
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordStatus(null);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setIsPasswordModalOpen(true);
  };

  const handlePasswordModalOpenChange = (open: boolean) => {
    setIsPasswordModalOpen(open);
    if (!open) {
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      if (passwordStatus?.type === "error") {
        setPasswordStatus(null);
      }
    }
  };

  const handleChangePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const refId = user?.refId || faculty?.faculty_id;
    if (!refId) {
      setPasswordStatus({ type: "error", message: "No faculty ID found for this account." });
      return;
    }

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordStatus({ type: "error", message: "Please complete all password fields." });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordStatus({ type: "error", message: "New password must be at least 8 characters long." });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: "error", message: "New password and confirmation do not match." });
      return;
    }

    setSavingPassword(true);
    setPasswordStatus(null);

    try {
      await api.post<{ message: string }>("/auth/change-password", {
        ref_id: refId,
        user_type: "Faculty",
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
      });

      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setPasswordStatus({ type: "success", message: "Password changed successfully." });
      setIsPasswordModalOpen(false);
    } catch (err) {
      setPasswordStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to change password.",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  useEffect(() => {
    if (loading || !faculty) return;

    const params = new URLSearchParams(location.search);
    if (params.get("forceChangePassword") !== "1") return;

    openPasswordModal();
    navigate(location.pathname, { replace: true });
  }, [loading, faculty, location.pathname, location.search, navigate]);

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
          <CardTitle>Account Reference</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-500">
              <UserRound className="h-3 w-3" /> Session Faculty ID
            </p>
            <p className="mt-1 font-medium text-gray-900">{user?.refId || faculty.faculty_id}</p>
          </div>
          <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-indigo-700">
                <KeyRound className="h-3 w-3" /> Security
              </p>
              <button
                type="button"
                onClick={openPasswordModal}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                <KeyRound className="h-4 w-4" />
                Change Password
              </button>
            </div>
            {passwordStatus?.type === "success" && (
              <p className="mt-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                {passwordStatus.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isPasswordModalOpen} onOpenChange={handlePasswordModalOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              If you logged in using a temporary password, set your permanent password now.
            </DialogDescription>
          </DialogHeader>

          {passwordStatus?.type === "error" && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {passwordStatus.message}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide font-medium text-gray-500">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(event) => setPasswordForm((previous) => ({ ...previous, currentPassword: event.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((previous) => !previous)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide font-medium text-gray-500">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(event) => setPasswordForm((previous) => ({ ...previous, newPassword: event.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((previous) => !previous)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide font-medium text-gray-500">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(event) => setPasswordForm((previous) => ({ ...previous, confirmPassword: event.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="Repeat new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((previous) => !previous)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                disabled={savingPassword}
                className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingPassword}
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingPassword ? "Changing Password..." : "Confirm Password Change"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
