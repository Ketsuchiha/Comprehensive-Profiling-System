import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { api } from "../utils/api";

type StudentFormData = {
  studentId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  program: string;
  yearLevel: string;
  section: string;
  dateOfBirth: string;
  sex: string;
  civilStatus: string;
  contactNumber: string;
  email: string;
  address: string;
  emergencyContact: string;
  emergencyContactNumber: string;
  nationality: string;
  religion: string;
  skills: string;
};

const emptyForm: StudentFormData = {
  studentId: "",
  firstName: "",
  middleName: "",
  lastName: "",
  program: "",
  yearLevel: "",
  section: "",
  dateOfBirth: "",
  sex: "Male",
  civilStatus: "Single",
  contactNumber: "",
  email: "",
  address: "",
  emergencyContact: "",
  emergencyContactNumber: "",
  nationality: "",
  religion: "",
  skills: "",
};

export function StudentForm() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(studentId);

  const [formData, setFormData] = useState<StudentFormData>(emptyForm);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditMode || !studentId) return;

    let isMounted = true;
    setLoading(true);
    setError("");

    api
      .get<any>(`/students/${encodeURIComponent(studentId)}`)
      .then((s) => {
        if (!isMounted) return;
        const resolvedSection = s.academic?.section || s.section || "";
        setFormData({
          studentId: s.student_id || "",
          firstName: s.first_name || "",
          middleName: s.middle_name || "",
          lastName: s.last_name || "",
          program: s.academic?.program || "",
          yearLevel: s.academic?.year_level ? String(s.academic.year_level) : "",
          section: resolvedSection,
          dateOfBirth: s.birth_date ? String(s.birth_date).split("T")[0] : "",
          sex: s.sex || "Male",
          civilStatus: s.civil_status || "Single",
          contactNumber: s.contact_number || "",
          email: s.email || "",
          address: s.address || "",
          emergencyContact: s.emergency_contact || "",
          emergencyContactNumber: s.emergency_contact_num || "",
          nationality: s.nationality || "",
          religion: s.religion || "",
          skills: s.skills || "",
        });
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load student record");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isEditMode, studentId]);

  const autoPassword = useMemo(() => {
    return `${(formData.lastName.trim()[0] || "X").toUpperCase()}${formData.dateOfBirth || "YYYY-MM-DD"}`;
  }, [formData.lastName, formData.dateOfBirth]);

  const setField = (field: keyof StudentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateRequired = () => {
    const checks: Array<[string, string]> = [
      ["First Name", formData.firstName],
      ["Last Name", formData.lastName],
      ["Date of Birth", formData.dateOfBirth],
      ["Sex", formData.sex],
      ["Contact Number", formData.contactNumber],
      ["Email", formData.email],
      ["Address", formData.address],
      ["Emergency Contact", formData.emergencyContact],
      ["Emergency Contact Number", formData.emergencyContactNumber],
    ];

    if (!isEditMode) {
      checks.unshift(["Student ID", formData.studentId]);
    }

    const missing = checks.filter(([, value]) => !value || !value.trim()).map(([label]) => label);
    return missing;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    const missing = validateRequired();
    if (missing.length > 0) {
      setError(`Please complete required fields: ${missing.join(", ")}`);
      return;
    }

    const payload = {
      first_name: formData.firstName.trim(),
      middle_name: formData.middleName.trim(),
      last_name: formData.lastName.trim(),
      birth_date: formData.dateOfBirth,
      sex: formData.sex.trim(),
      civil_status: formData.civilStatus.trim(),
      contact_number: formData.contactNumber.trim(),
      email: formData.email.trim().toLowerCase(),
      address: formData.address.trim(),
      emergency_contact: formData.emergencyContact.trim(),
      emergency_contact_num: formData.emergencyContactNumber.trim(),
      nationality: formData.nationality.trim(),
      religion: formData.religion.trim(),
      skills: formData.skills.trim(),
      section: formData.section.trim() || null,
    };

    setSaving(true);
    try {
      if (isEditMode && studentId) {
        await api.put(`/students/${encodeURIComponent(studentId)}`, payload);
        await api.put(`/students/${encodeURIComponent(studentId)}/academic`, {
          program: formData.program || null,
          year_level: formData.yearLevel ? Number(formData.yearLevel) : null,
          section: formData.section || null,
          enrollment_status: "Enrolled",
        });
      } else {
        await api.post(`/students`, {
          student_id: formData.studentId.trim(),
          ...payload,
          academic: {
            program: formData.program || null,
            year_level: formData.yearLevel ? Number(formData.yearLevel) : null,
            section: formData.section || null,
            enrollment_status: "Enrolled",
          },
        });
      }

      navigate("/students");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save student");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{isEditMode ? "Edit Student" : "Add New Student"}</h1>
            <p className="text-gray-600">{isEditMode ? "Update student details" : "Create a new student profile"}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/students")}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Back to List
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          {loading ? (
            <p className="text-sm text-gray-600">Loading student data...</p>
          ) : (
            <form onSubmit={submit} className="grid grid-cols-2 gap-4">
              {error && (
                <div className="col-span-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Student ID *</label>
                <input
                  type="text"
                  required
                  disabled={isEditMode}
                  title="Student ID"
                  value={formData.studentId}
                  onChange={(e) => setField("studentId", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">First Name *</label>
                <input type="text" title="First Name" required value={formData.firstName} onChange={(e) => setField("firstName", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Middle Name</label>
                <input type="text" title="Middle Name" value={formData.middleName} onChange={(e) => setField("middleName", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name *</label>
                <input type="text" title="Last Name" required value={formData.lastName} onChange={(e) => setField("lastName", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Program</label>
                <input type="text" title="Program" value={formData.program} onChange={(e) => setField("program", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Year Level</label>
                <select title="Year Level" value={formData.yearLevel} onChange={(e) => setField("yearLevel", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="">Select year</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Section</label>
                <input type="text" title="Section" value={formData.section} onChange={(e) => setField("section", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Date of Birth *</label>
                <input type="date" title="Date of Birth" required value={formData.dateOfBirth} onChange={(e) => setField("dateOfBirth", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Sex *</label>
                <select title="Sex" required value={formData.sex} onChange={(e) => setField("sex", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Civil Status *</label>
                <select title="Civil Status" required value={formData.civilStatus} onChange={(e) => setField("civilStatus", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Separated">Separated</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Number *</label>
                <input type="tel" title="Contact Number" required value={formData.contactNumber} onChange={(e) => setField("contactNumber", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                <input type="email" title="Email" required value={formData.email} onChange={(e) => setField("email", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Address *</label>
                <textarea title="Address" required rows={2} value={formData.address} onChange={(e) => setField("address", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Emergency Contact *</label>
                <input type="text" title="Emergency Contact" required value={formData.emergencyContact} onChange={(e) => setField("emergencyContact", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Emergency Contact Number *</label>
                <input type="tel" title="Emergency Contact Number" required value={formData.emergencyContactNumber} onChange={(e) => setField("emergencyContactNumber", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nationality</label>
                <input type="text" title="Nationality" value={formData.nationality} onChange={(e) => setField("nationality", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Religion</label>
                <input type="text" title="Religion" value={formData.religion} onChange={(e) => setField("religion", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Skills</label>
                <input type="text" title="Skills" value={formData.skills} onChange={(e) => setField("skills", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>

              {!isEditMode && (
                <div className="col-span-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-800">
                  <p>Auto-generated password: {autoPassword}</p>
                  <p className="mt-1 text-xs">Temporary password only. Require account owner to change password after first login.</p>
                </div>
              )}

              <div className="col-span-2 flex gap-3 mt-4">
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-60">
                  {saving ? "Saving..." : isEditMode ? "Save Changes" : "Add Student"}
                </button>
                <button type="button" onClick={() => navigate("/students")} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
