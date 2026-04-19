import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Mail, Phone, MapPin, AlertCircle, Camera, KeyRound, Edit3, Save, X, Eye, EyeOff } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { useEffect, useMemo, useState } from "react";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

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

type StatusMessage = {
  type: "success" | "error";
  message: string;
};

const fallbackProfilePhoto = "https://images.unsplash.com/photo-1600178572204-6ac8886aae63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBzdHVkZW50JTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyNDUzNjY0fDA&ixlib=rb-4.1.0&q=80&w=1080";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [contactStatus, setContactStatus] = useState<StatusMessage | null>(null);
  const [contactForm, setContactForm] = useState({
    email: "",
    address: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<StatusMessage | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEditConfirmOpen, setIsEditConfirmOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        setContactForm({
          email: data.email || "",
          address: data.address || "",
        });
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

  const handleCancelContactEdit = () => {
    if (!student) return;
    setContactForm({
      email: student.email || "",
      address: student.address || "",
    });
    setContactStatus(null);
    setIsEditConfirmOpen(false);
    setIsEditingContact(false);
  };

  const handleSaveContact = async () => {
    setIsEditConfirmOpen(false);
    if (!user?.refId || !student) return;

    const normalizedEmail = contactForm.email.trim().toLowerCase();
    const normalizedAddress = contactForm.address.trim();

    if (!normalizedEmail || !normalizedAddress) {
      setContactStatus({
        type: "error",
        message: "Email and address are required.",
      });
      return;
    }

    setSavingContact(true);
    setContactStatus(null);

    try {
      await api.put<{ message: string }>(`/students/${encodeURIComponent(user.refId)}`, {
        email: normalizedEmail,
        address: normalizedAddress,
      });

      setStudent((previous) => {
        if (!previous) return previous;
        return {
          ...previous,
          email: normalizedEmail,
          address: normalizedAddress,
        };
      });
      updateUser({ email: normalizedEmail });
      setContactStatus({ type: "success", message: "Contact information updated successfully." });
      setIsEditingContact(false);
    } catch (err) {
      setContactStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to update contact information.",
      });
    } finally {
      setSavingContact(false);
    }
  };

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
    if (!user?.refId) return;

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
      try {
        await api.post<{ message: string }>(`/students/${encodeURIComponent(user.refId)}/change-password`, {
          current_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword,
        });
      } catch (firstError) {
        const message = firstError instanceof Error ? firstError.message : "";
        if (!message.toLowerCase().includes("http 404")) {
          throw firstError;
        }

        await api.post<{ message: string }>("/auth/change-password", {
          ref_id: user.refId,
          user_type: "Student",
          current_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword,
        });
      }

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
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                    <Phone className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Contact Information</h3>
                </div>
                {!isEditingContact ? (
                  <button
                    type="button"
                    onClick={() => {
                      setContactStatus(null);
                      setIsEditingContact(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </button>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditConfirmOpen(true)}
                      disabled={savingContact}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelContactEdit}
                      disabled={savingContact}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {contactStatus && (
                <div
                  className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
                    contactStatus.type === "success"
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {contactStatus.message}
                </div>
              )}

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
                  {isEditingContact ? (
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(event) => setContactForm((previous) => ({ ...previous, email: event.target.value }))}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="you@example.com"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{student.email || "-"}</p>
                  )}
                </div>

                <div className="space-y-2 p-4 rounded-lg bg-gray-50 border border-gray-100 sm:col-span-2">
                  <label className="text-xs uppercase tracking-wide font-medium text-gray-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Address
                  </label>
                  {isEditingContact ? (
                    <textarea
                      value={contactForm.address}
                      onChange={(event) => setContactForm((previous) => ({ ...previous, address: event.target.value }))}
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="Enter your current address"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{student.address || "-"}</p>
                  )}
                </div>
              </div>

              <AlertDialog open={isEditConfirmOpen} onOpenChange={setIsEditConfirmOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Profile Changes</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to save your email and address changes?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={savingContact}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        void handleSaveContact();
                      }}
                      disabled={savingContact}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {savingContact ? "Saving..." : "Confirm Save"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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

            {/* Password Change */}
            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                    <KeyRound className="h-4 w-4 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Security</h3>
                </div>
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
                <div
                  className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
                    "border-green-200 bg-green-50 text-green-700"
                  }`}
                >
                  {passwordStatus.message}
                </div>
              )}

              <Dialog open={isPasswordModalOpen} onOpenChange={handlePasswordModalOpenChange}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                      Enter your present password and your new password.
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}