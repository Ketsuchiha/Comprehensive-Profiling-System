import { useEffect, useMemo, useState } from "react";
import { api } from "../utils/api";
import { resolveFacultyId } from "../utils/facultySession";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

type FacultyStudent = {
  student_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  program: string | null;
  year_level: number | null;
  section: string | null;
};

type FacultySchedule = {
  subject_code: string | null;
  subject_name: string | null;
};

type GradeRecord = {
  grade_id: number;
  student_id: string;
  subject_code: string;
  subject_name: string | null;
  semester: string | null;
  academic_year: string | null;
  midterm_grade: number | null;
  final_grade: number | null;
  gpa: number | null;
  remarks: string | null;
};

type StudentCourse = {
  subject_code: string;
  subject_name: string | null;
};

type GradeForm = {
  subject_code: string;
  semester: string;
  academic_year: string;
  midterm_grade: string;
  final_grade: string;
  gpa: string;
  remarks: string;
};

const defaultForm: GradeForm = {
  subject_code: "",
  semester: "",
  academic_year: "",
  midterm_grade: "",
  final_grade: "",
  gpa: "",
  remarks: "",
};

function fullName(student: FacultyStudent) {
  return [student.first_name, student.middle_name, student.last_name].filter(Boolean).join(" ");
}

export default function StudentGrading() {
  const { user } = useAuth();
  const [facultyId, setFacultyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [students, setStudents] = useState<FacultyStudent[]>([]);
  const [subjects, setSubjects] = useState<Array<{ subject_code: string; subject_name: string }>>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [registeredCourses, setRegisteredCourses] = useState<StudentCourse[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [form, setForm] = useState<GradeForm>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [editingGradeId, setEditingGradeId] = useState<number | null>(null);

  const selectedStudent = useMemo(
    () => students.find((student) => student.student_id === selectedStudentId) || null,
    [selectedStudentId, students]
  );

  const availableSubjects = useMemo(() => {
    const registeredCodeSet = new Set(
      registeredCourses
        .map((course) => (course.subject_code || "").trim().toUpperCase())
        .filter(Boolean)
    );

    return subjects.filter((subject) => registeredCodeSet.has(subject.subject_code.trim().toUpperCase()));
  }, [registeredCourses, subjects]);

  const fetchGrades = async (studentId: string) => {
    if (!studentId) {
      setGrades([]);
      return;
    }

    const data = await api.get<GradeRecord[]>(`/students/${encodeURIComponent(studentId)}/grades`);
    setGrades(data);
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setError("No faculty session found.");
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError("");

    resolveFacultyId(user)
      .then(async (facultyId) => {
        setFacultyId(facultyId);
        const [studentRows, scheduleRows] = await Promise.all([
          api.get<FacultyStudent[]>(`/faculty/${encodeURIComponent(facultyId)}/students`).catch(() => []),
          api.get<FacultySchedule[]>(`/faculty/${encodeURIComponent(facultyId)}/schedules`).catch(() => []),
        ]);

        const uniqueSubjects = new Map<string, string>();
        scheduleRows.forEach((row) => {
          if (!row.subject_code) return;
          uniqueSubjects.set(row.subject_code, row.subject_name || row.subject_code);
        });

        return {
          studentRows,
          subjectRows: Array.from(uniqueSubjects.entries()).map(([subject_code, subject_name]) => ({
            subject_code,
            subject_name,
          })),
        };
      })
      .then(async ({ studentRows, subjectRows }) => {
        if (!isMounted) return;
        setStudents(studentRows);
        setSubjects(subjectRows);

        if (studentRows.length > 0) {
          setSelectedStudentId(studentRows[0].student_id);
          await fetchGrades(studentRows[0].student_id);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load grading data.");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    setFormSuccess("");
    setFormError("");
    setEditingGradeId(null);
    setForm(defaultForm);

    if (!selectedStudentId) {
      setGrades([]);
      setRegisteredCourses([]);
      return;
    }

    setCoursesLoading(true);
    Promise.all([
      fetchGrades(selectedStudentId),
      api.get<StudentCourse[]>(`/students/${encodeURIComponent(selectedStudentId)}/courses`).catch(() => []),
    ])
      .then(([, courseRows]) => {
        setRegisteredCourses(courseRows);
      })
      .finally(() => {
        setCoursesLoading(false);
      });
  }, [selectedStudentId]);

  const startEdit = (grade: GradeRecord) => {
    setEditingGradeId(grade.grade_id);
    setForm({
      subject_code: grade.subject_code || "",
      semester: grade.semester || "",
      academic_year: grade.academic_year || "",
      midterm_grade: grade.midterm_grade == null ? "" : String(grade.midterm_grade),
      final_grade: grade.final_grade == null ? "" : String(grade.final_grade),
      gpa: grade.gpa == null ? "" : String(grade.gpa),
      remarks: grade.remarks || "",
    });
    setFormError("");
    setFormSuccess("");
  };

  const resetForm = () => {
    setEditingGradeId(null);
    setForm(defaultForm);
    setFormError("");
  };

  const handleSaveGrade = async () => {
    if (!selectedStudentId) {
      setFormError("Please select a student first.");
      return;
    }
    if (!form.subject_code.trim()) {
      setFormError("Subject is required.");
      return;
    }
    const isAllowedSubject = availableSubjects.some((subject) => subject.subject_code === form.subject_code.trim());
    if (!isAllowedSubject) {
      setFormError("You can only grade the selected student for subjects they are registered in and you teach.");
      return;
    }

    setSaving(true);
    setFormError("");
    setFormSuccess("");

    try {
      const payload = {
        subject_code: form.subject_code.trim(),
        semester: form.semester.trim() || null,
        academic_year: form.academic_year.trim() || null,
        midterm_grade: form.midterm_grade.trim() ? Number(form.midterm_grade) : null,
        final_grade: form.final_grade.trim() ? Number(form.final_grade) : null,
        gpa: form.gpa.trim() ? Number(form.gpa) : null,
        remarks: form.remarks.trim() || null,
        faculty_id: facultyId || null,
      };

      if (editingGradeId) {
        await api.put(`/students/grades/${editingGradeId}`, payload);
        setFormSuccess("Grade updated successfully.");
      } else {
        await api.post(`/students/${encodeURIComponent(selectedStudentId)}/grades`, payload);
        setFormSuccess("Grade recorded successfully.");
      }

      await fetchGrades(selectedStudentId);
      resetForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save grade.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Student Grading</h1>
        <p className="mt-1 text-sm text-gray-500">Record and update grades for students in your handled classes.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Select Student</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-gray-500">Loading students...</p>
          ) : students.length === 0 ? (
            <p className="text-sm text-gray-500">No handled students found for your account yet.</p>
          ) : (
            <div className="space-y-3">
              <select
                value={selectedStudentId}
                onChange={(event) => setSelectedStudentId(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {students.map((student) => (
                  <option key={student.student_id} value={student.student_id}>
                    {student.student_id} - {fullName(student)}
                  </option>
                ))}
              </select>
              {selectedStudent && (
                <p className="text-sm text-gray-600">
                  {selectedStudent.program || "Program N/A"} • Year {selectedStudent.year_level || "-"} • Section {selectedStudent.section || "-"}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{editingGradeId ? "Update Grade" : "Record Grade"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">Subject</label>
              <select
                value={form.subject_code}
                onChange={(event) => setForm((prev) => ({ ...prev, subject_code: event.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select subject</option>
                {availableSubjects.map((subject) => (
                  <option key={subject.subject_code} value={subject.subject_code}>
                    {subject.subject_code} - {subject.subject_name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Only subjects this student is registered in under your class assignments are listed.
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Semester</label>
              <input
                value={form.semester}
                onChange={(event) => setForm((prev) => ({ ...prev, semester: event.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="1st / 2nd"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Academic Year</label>
              <input
                value={form.academic_year}
                onChange={(event) => setForm((prev) => ({ ...prev, academic_year: event.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="2026-2027"
              />
            </div>
          </div>

          {!coursesLoading && selectedStudentId && availableSubjects.length === 0 && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
              This student has no registered subjects that match your teaching assignments.
            </p>
          )}

          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Midterm Grade</label>
              <input
                type="number"
                step="0.01"
                value={form.midterm_grade}
                onChange={(event) => setForm((prev) => ({ ...prev, midterm_grade: event.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Final Grade</label>
              <input
                type="number"
                step="0.01"
                value={form.final_grade}
                onChange={(event) => setForm((prev) => ({ ...prev, final_grade: event.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">GPA</label>
              <input
                type="number"
                step="0.01"
                value={form.gpa}
                onChange={(event) => setForm((prev) => ({ ...prev, gpa: event.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Remarks</label>
            <textarea
              value={form.remarks}
              onChange={(event) => setForm((prev) => ({ ...prev, remarks: event.target.value }))}
              className="min-h-20 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Passed / Failed / Incomplete"
            />
          </div>

          {formError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
          )}
          {formSuccess && (
            <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{formSuccess}</p>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void handleSaveGrade()}
              disabled={saving || !selectedStudentId}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : editingGradeId ? "Update Grade" : "Save Grade"}
            </button>
            {editingGradeId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recorded Grades</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedStudentId === "" ? (
            <p className="text-sm text-gray-500">Select a student to view grades.</p>
          ) : grades.length === 0 ? (
            <p className="text-sm text-gray-500">No grades recorded for this student yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-600">
                  <tr>
                    <th className="px-3 py-2">Subject</th>
                    <th className="px-3 py-2">Semester</th>
                    <th className="px-3 py-2">Academic Year</th>
                    <th className="px-3 py-2">Midterm</th>
                    <th className="px-3 py-2">Final</th>
                    <th className="px-3 py-2">GPA</th>
                    <th className="px-3 py-2">Remarks</th>
                    <th className="px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((grade) => (
                    <tr key={grade.grade_id} className="border-t border-gray-100">
                      <td className="px-3 py-2">{grade.subject_code} {grade.subject_name ? `- ${grade.subject_name}` : ""}</td>
                      <td className="px-3 py-2">{grade.semester || "-"}</td>
                      <td className="px-3 py-2">{grade.academic_year || "-"}</td>
                      <td className="px-3 py-2">{grade.midterm_grade ?? "-"}</td>
                      <td className="px-3 py-2">{grade.final_grade ?? "-"}</td>
                      <td className="px-3 py-2">{grade.gpa ?? "-"}</td>
                      <td className="px-3 py-2">{grade.remarks || "-"}</td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => startEdit(grade)}
                          className="rounded-md bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
                        >
                          Edit
                        </button>
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
