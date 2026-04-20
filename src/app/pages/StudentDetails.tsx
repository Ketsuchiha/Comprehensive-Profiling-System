import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { api } from "../utils/api";

export function StudentDetails() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const resolvedSection = student?.academic?.section || student?.section || "-";

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      setError("Student ID is required.");
      return;
    }

    let isMounted = true;
    setLoading(true);

    api
      .get<any>(`/students/${encodeURIComponent(studentId)}`)
      .then((data) => {
        if (!isMounted) return;
        setStudent(data);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load student details");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [studentId]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Student Details</h1>
          <div className="flex gap-2">
            <button onClick={() => navigate("/students")} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">Back</button>
            
          </div>
        </div>

        {loading && <p className="text-sm text-gray-600">Loading student details...</p>}
        {!loading && error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && student && (
          <div className="grid grid-cols-2 gap-6">
            <div><p className="text-sm font-semibold text-gray-600">Student ID</p><p className="mt-1">{student.student_id}</p></div>
            <div><p className="text-sm font-semibold text-gray-600">First Name</p><p className="mt-1">{student.first_name}</p></div>
            <div><p className="text-sm font-semibold text-gray-600">Middle Name</p><p className="mt-1">{student.middle_name || "-"}</p></div>
            <div><p className="text-sm font-semibold text-gray-600">Last Name</p><p className="mt-1">{student.last_name}</p></div>
            <div><p className="text-sm font-semibold text-gray-600">Date of Birth</p><p className="mt-1">{String(student.birth_date || "").split("T")[0] || "-"}</p></div>
            <div><p className="text-sm font-semibold text-gray-600">Program</p><p className="mt-1">{student.academic?.program || "-"}</p></div>
            <div><p className="text-sm font-semibold text-gray-600">Year / Section</p><p className="mt-1">{student.academic?.year_level || "-"} / {resolvedSection}</p></div>
            <div><p className="text-sm font-semibold text-gray-600">Sex</p><p className="mt-1">{student.sex || "-"}</p></div>
            <div><p className="text-sm font-semibold text-gray-600">Civil Status</p><p className="mt-1">{student.civil_status || "-"}</p></div>
            <div><p className="text-sm font-semibold text-gray-600">Contact Number</p><p className="mt-1">{student.contact_number || "-"}</p></div>
            <div><p className="text-sm font-semibold text-gray-600">Email</p><p className="mt-1">{student.email || "-"}</p></div>
            <div className="col-span-2"><p className="text-sm font-semibold text-gray-600">Address</p><p className="mt-1">{student.address || "-"}</p></div>
            <div><p className="text-sm font-semibold text-gray-600">Emergency Contact</p><p className="mt-1">{student.emergency_contact || "-"}</p></div>
            <div><p className="text-sm font-semibold text-gray-600">Emergency Contact Number</p><p className="mt-1">{student.emergency_contact_num || "-"}</p></div>
            <div><p className="text-sm font-semibold text-gray-600">Nationality</p><p className="mt-1">{student.nationality || "-"}</p></div>
            <div><p className="text-sm font-semibold text-gray-600">Religion</p><p className="mt-1">{student.religion || "-"}</p></div>
            <div className="col-span-2"><p className="text-sm font-semibold text-gray-600">Skills</p><p className="mt-1">{student.skills || "-"}</p></div>
          </div>
        )}
      </div>
    </div>
  );
}
