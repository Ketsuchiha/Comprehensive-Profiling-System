import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { resolveFacultyId } from "../utils/facultySession";

type SyllabusRow = {
  syllabus_id: number;
  subject_code: string | null;
  subject_name: string | null;
  faculty_id: string | null;
  semester: string | null;
  academic_year: string | null;
  is_approved: number | null;
  created_at: string | null;
};

type FacultyLoadRow = {
  subject_code: string | null;
  subject_name: string | null;
  subject_units?: number | null;
  semester?: string | null;
  academic_year?: string | null;
};

type SyllabusFormState = {
  subjectCode: string;
  semester: "" | "1st" | "2nd" | "Summer";
  academicYear: string;
  courseDescription: string;
};

export default function AuthoredSyllabi() {
  const { user } = useAuth();
  const [items, setItems] = useState<SyllabusRow[]>([]);
  const [facultyId, setFacultyId] = useState<string>("");
  const [assignedSubjects, setAssignedSubjects] = useState<FacultyLoadRow[]>([]);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const getCurrentAcademicYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    if (month >= 5) {
      return `${year}-${year + 1}`;
    }
    return `${year - 1}-${year}`;
  };

  const [form, setForm] = useState<SyllabusFormState>({
    subjectCode: "",
    semester: "",
    academicYear: getCurrentAcademicYear(),
    courseDescription: "",
  });

  const loadSyllabi = async (resolvedFacultyId: string) => {
    const rows = await api.get<SyllabusRow[]>("/instruments/syllabus");
    setItems((rows || []).filter((row) => row.faculty_id === resolvedFacultyId));
  };

  const loadAssignedSubjects = async (resolvedFacultyId: string) => {
    try {
      const rows = await api.get<FacultyLoadRow[]>(`/faculty/${encodeURIComponent(resolvedFacultyId)}/schedules`);

      const deduped = Array.from(
        new Map(
          (rows || [])
            .filter((row) => row.subject_code)
            .map((row) => [String(row.subject_code), row])
        ).values()
      );

      setAssignedSubjects(deduped);
      if (!form.subjectCode && deduped.length > 0) {
        setForm((previous) => ({ ...previous, subjectCode: String(deduped[0].subject_code || "") }));
      }
    } catch (err) {
      console.error('Failed to load assigned subjects:', err);
      setError(`Failed to load subjects from your schedule: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (!user) {
      setLoading(false);
      setError("No faculty session found.");
      return;
    }

    setLoading(true);
    setError("");

    const directRefId = (user.refId || "").trim();
    const facultyIdPromise = directRefId
      ? Promise.resolve(directRefId)
      : resolveFacultyId(user);

    facultyIdPromise
      .then(async (resolvedId) => {
        if (!isMounted) return;
        setFacultyId(resolvedId);
        await Promise.all([loadSyllabi(resolvedId), loadAssignedSubjects(resolvedId)]);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load authored syllabi.");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      return;
    }

    const maxFileSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxFileSizeBytes) {
      setSubmitError("File is too large. Maximum supported size is 10 MB.");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setSubmitError("");
    setSelectedFile(file);
  };

  const handleCreateSyllabus = async () => {
    setSubmitError("");
    setSubmitSuccess("");

    if (!facultyId) {
      setSubmitError("Unable to resolve your faculty profile.");
      return;
    }

    const subjectCode = form.subjectCode.trim().toUpperCase();
    if (!subjectCode) {
      setSubmitError("Subject code is required.");
      return;
    }

    try {
      setIsSubmitting(true);

      const fileDataBase64 = selectedFile
        ? await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ""));
          reader.onerror = () => reject(new Error("Failed to read selected file."));
          reader.readAsDataURL(selectedFile);
        })
        : undefined;

      await api.post<{ syllabus_id: number }>("/instruments/syllabus", {
        subject_code: subjectCode,
        faculty_id: facultyId,
        semester: form.semester || undefined,
        academic_year: form.academicYear.trim() || undefined,
        course_description: form.courseDescription.trim() || undefined,
        file_name: selectedFile?.name,
        mime_type: selectedFile?.type || undefined,
        file_data_base64: fileDataBase64,
      });

      await loadSyllabi(facultyId);
      setSubmitSuccess("Syllabus uploaded successfully.");
      setForm((previous) => ({
        ...previous,
        semester: "",
        courseDescription: "",
        academicYear: getCurrentAcademicYear(),
      }));
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to upload syllabus.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const approvedCount = useMemo(
    () => items.filter((row) => Number(row.is_approved) === 1).length,
    [items]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Authored Syllabi</h1>
        <p className="mt-1 text-sm text-gray-500">Create and manage syllabi linked to your faculty account.</p>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Add Syllabus</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{submitError}</div>
          )}
          {submitSuccess && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{submitSuccess}</div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Subject *</label>
              <select
                value={form.subjectCode}
                onChange={(event) => setForm((previous) => ({ ...previous, subjectCode: event.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="">Select subject</option>
                {assignedSubjects.map((subject) => (
                  <option key={subject.subject_code || "-"} value={subject.subject_code || ""}>
                    {subject.subject_code} - {subject.subject_name || "Untitled Subject"}
                    {subject.subject_units != null ? ` (${subject.subject_units} units)` : ""}
                  </option>
                ))}
              </select>
              {assignedSubjects.length === 0 && !loading && (
                <p className="mt-1 text-xs text-red-600">
                  No assigned subjects found for faculty ID {facultyId || "(missing)"}. Please verify this faculty has entries in faculty load or schedule.
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Semester</label>
              <select
                value={form.semester}
                onChange={(event) => setForm((previous) => ({ ...previous, semester: event.target.value as SyllabusFormState["semester"] }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="">Select semester</option>
                <option value="1st">1st</option>
                <option value="2nd">2nd</option>
                <option value="Summer">Summer</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Academic Year</label>
              <input
                value={form.academicYear}
                onChange={(event) => setForm((previous) => ({ ...previous, academicYear: event.target.value }))}
                placeholder="e.g. 2026-2027"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Syllabus File</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(event) => handleFileChange(event.target.files?.[0] || null)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm file:mr-4 file:rounded file:border-0 file:bg-orange-50 file:px-3 file:py-1 file:text-orange-700"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={3}
              value={form.courseDescription}
              onChange={(event) => setForm((previous) => ({ ...previous, courseDescription: event.target.value }))}
              placeholder="Optional notes about this syllabus"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={isSubmitting || loading}
              onClick={handleCreateSyllabus}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Uploading..." : "Add Syllabus"}
            </button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Authored Syllabi</p>
            <p className="mt-2 text-3xl font-semibold text-orange-600">{loading ? "..." : items.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Approved Syllabi</p>
            <p className="mt-2 text-3xl font-semibold text-amber-600">{loading ? "..." : approvedCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Syllabus/Module List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-gray-500">Loading syllabi...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-gray-500">No authored syllabi found.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-600">
                  <tr>
                    <th className="px-3 py-2">Syllabus ID</th>
                    <th className="px-3 py-2">Subject Code</th>
                    <th className="px-3 py-2">Subject Name</th>
                    <th className="px-3 py-2">Term</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row) => (
                    <tr key={row.syllabus_id} className="border-t border-gray-100">
                      <td className="px-3 py-2">{row.syllabus_id}</td>
                      <td className="px-3 py-2">{row.subject_code || "-"}</td>
                      <td className="px-3 py-2">{row.subject_name || "-"}</td>
                      <td className="px-3 py-2">{`${row.semester || "N/A"} | ${row.academic_year || "N/A"}`}</td>
                      <td className="px-3 py-2">
                        <Badge variant="outline">{Number(row.is_approved) === 1 ? "Approved" : "Draft"}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
