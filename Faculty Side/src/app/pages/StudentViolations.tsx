import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Filter, Search, Plus, Trash2, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { api } from "../utils/api";

interface ViolationRecord {
  violation_id: number;
  student_id: string;
  violation_type: string;
  subject_context: string | null;
  description: string | null;
  severity: string | null;
  status: string | null;
  incident_date: string;
  reported_by_name: string | null;
  student_first_name?: string | null;
  student_last_name?: string | null;
}

const statusOptions = ["All", "Active", "Resolved", "Dismissed"] as const;

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getSeverityStyles(severity: string | null) {
  switch (severity) {
    case "Major":
      return "bg-red-100 text-red-700 border-red-200";
    case "Serious":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "Minor":
      return "bg-green-100 text-green-700 border-green-200";
    default:
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
  }
}

function getStatusStyles(status: string | null) {
  switch (status) {
    case "Resolved":
      return "bg-green-100 text-green-700 border-green-200";
    case "Dismissed":
      return "bg-gray-100 text-gray-700 border-gray-200";
    default:
      return "bg-orange-100 text-orange-700 border-orange-200";
  }
}

function getStudentName(record: ViolationRecord) {
  const fullName = `${record.student_first_name || ""} ${record.student_last_name || ""}`.trim();
  return fullName || record.student_id;
}

export function StudentViolations() {
  const [violations, setViolations] = useState<ViolationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<(typeof statusOptions)[number]>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [settling, setSettling] = useState<number | null>(null);
  const [createError, setCreateError] = useState("");
  const [formData, setFormData] = useState({
    student_id: "",
    violation_type: "",
    severity: "Minor",
    description: "",
    subject_context: "",
  });

  useEffect(() => {
    let isMounted = true;

    const fetchViolations = async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({ limit: "200" });
        if (selectedStatus !== "All") {
          params.set("status", selectedStatus);
        }

        const rows = await api.get<ViolationRecord[]>(`/violations?${params.toString()}`);
        if (!isMounted) return;
        setViolations(Array.isArray(rows) ? rows : []);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load violations.");
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    fetchViolations();

    return () => {
      isMounted = false;
    };
  }, [selectedStatus]);

  const handleCreateViolation = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");

    if (!formData.student_id.trim()) {
      setCreateError("Student ID is required");
      return;
    }
    if (!formData.violation_type.trim()) {
      setCreateError("Violation type is required");
      return;
    }

    try {
      const payload = {
        student_id: formData.student_id.trim(),
        violation_type: formData.violation_type.trim(),
        severity: formData.severity,
        description: formData.description.trim() || null,
        subject_context: formData.subject_context.trim() || null,
        incident_date: new Date().toISOString(),
        status: "Active",
      };

      await api.post("/violations", payload);

      // Refresh violations list
      const params = new URLSearchParams({ limit: "200" });
      if (selectedStatus !== "All") {
        params.set("status", selectedStatus);
      }
      const rows = await api.get<ViolationRecord[]>(`/violations?${params.toString()}`);
      setViolations(Array.isArray(rows) ? rows : []);

      // Reset form
      setFormData({
        student_id: "",
        violation_type: "",
        severity: "Minor",
        description: "",
        subject_context: "",
      });
      setShowCreateModal(false);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create violation");
    }
  };

  const handleSettleViolation = async (violationId: number) => {
    setSettling(violationId);
    try {
      await api.put(`/violations/${violationId}`, { status: "Resolved" });

      // Update local state
      setViolations(violations.map((v) =>
        v.violation_id === violationId ? { ...v, status: "Resolved" } : v
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to settle violation");
    } finally {
      setSettling(null);
    }
  };

  const handleDeleteViolation = async (violationId: number) => {
    if (!window.confirm("Are you sure you want to delete this violation?")) {
      return;
    }

    setDeleting(violationId);
    try {
      await api.delete(`/violations/${violationId}`);

      // Update local state
      setViolations(violations.filter((v) => v.violation_id !== violationId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete violation");
    } finally {
      setDeleting(null);
    }
  };

  const dismissModal = () => {
    setShowCreateModal(false);
    setFormData({
      student_id: "",
      violation_type: "",
      severity: "Minor",
      description: "",
      subject_context: "",
    });
    setCreateError("");
  };

  const filteredViolations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return violations;

    return violations.filter((violation) => {
      const studentName = getStudentName(violation).toLowerCase();
      const type = violation.violation_type?.toLowerCase() || "";
      const subject = violation.subject_context?.toLowerCase() || "";
      const description = violation.description?.toLowerCase() || "";
      const reporter = violation.reported_by_name?.toLowerCase() || "";
      const status = violation.status?.toLowerCase() || "";

      return (
        studentName.includes(query) ||
        type.includes(query) ||
        subject.includes(query) ||
        description.includes(query) ||
        reporter.includes(query) ||
        status.includes(query)
      );
    });
  }, [violations, searchQuery]);

  const activeCount = violations.filter((v) => v.status === "Active").length;
  const resolvedCount = violations.filter((v) => v.status === "Resolved").length;
  const dismissedCount = violations.filter((v) => v.status === "Dismissed").length;

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-orange-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Violations</h1>
            <p className="mt-1 text-gray-600">Track all reported student violations and create new reports.</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-white font-medium hover:bg-red-700 transition"
        >
          <Plus className="h-5 w-5" />
          Report Violation
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="mt-2 text-3xl font-bold text-orange-600">{activeCount}</p>
              </div>
              <AlertTriangle className="h-12 w-12 text-orange-100" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="mt-2 text-3xl font-bold text-green-600">{resolvedCount}</p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dismissed</p>
                <p className="mt-2 text-3xl font-bold text-gray-600">{dismissedCount}</p>
              </div>
              <div className="rounded-full bg-gray-100 p-3">
                <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Filter Records</h2>
          <p className="mt-1 text-sm text-gray-600">Search by student name, violation type, subject, or reporter.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-12">
          <div className="sm:col-span-9">
            <label htmlFor="search-violations" className="mb-2 block text-xs font-medium text-gray-700">
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="search-violations"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Student, type, subject, or reporter"
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-500 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="status-filter" className="mb-2 block text-xs font-medium text-gray-700">
              Status
            </label>
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                id="status-filter"
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value as (typeof statusOptions)[number])}
                className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-10 text-sm text-gray-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">
          Violations ({filteredViolations.length})
        </h2>

        {loading && (
          <div className="py-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-orange-500"></div>
            <p className="mt-4 text-gray-600">Loading violations...</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && filteredViolations.length === 0 && (
          <div className="py-12 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-gray-600">No violations found.</p>
          </div>
        )}

        {!loading && filteredViolations.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Student</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Violation</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Severity</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Reported By</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredViolations.map((violation) => (
                  <tr key={violation.violation_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{formatDate(violation.incident_date)}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{getStudentName(violation)}</p>
                        <p className="text-xs text-gray-500">{violation.student_id}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{violation.violation_type}</p>
                        <p className="text-xs text-gray-500">{violation.description || "No description"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`border ${getSeverityStyles(violation.severity)}`}>
                        {violation.severity || "Unknown"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`border ${getStatusStyles(violation.status)}`}>
                        {violation.status || "Unknown"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{violation.reported_by_name || "System"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {violation.status !== "Resolved" && (
                          <button
                            onClick={() => handleSettleViolation(violation.violation_id)}
                            disabled={settling === violation.violation_id}
                            className="flex items-center gap-1 rounded px-2.5 py-1.5 text-sm font-medium text-green-600 hover:bg-green-50 disabled:opacity-50"
                            title="Mark as settled"
                          >
                            <Check className="h-4 w-4" />
                            <span className="hidden sm:inline">Settled</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteViolation(violation.violation_id)}
                          disabled={deleting === violation.violation_id}
                          className="flex items-center gap-1 rounded px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                          title="Delete violation"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Violation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900">Report Student Violation</h2>
              <p className="mt-1 text-sm text-gray-600">Create a new violation record for a student.</p>
            </div>

            <form onSubmit={handleCreateViolation} className="space-y-6 px-6 py-4">
              {createError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {createError}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="student_id" className="block text-sm font-medium text-gray-700">
                    Student ID <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="student_id"
                    type="text"
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                    placeholder="e.g., 2024-001234"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label htmlFor="violation_type" className="block text-sm font-medium text-gray-700">
                    Violation Type <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="violation_type"
                    type="text"
                    value={formData.violation_type}
                    onChange={(e) => setFormData({ ...formData, violation_type: e.target.value })}
                    placeholder="e.g., late submission, misconduct"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label htmlFor="severity" className="block text-sm font-medium text-gray-700">
                    Severity <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="severity"
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  >
                    <option value="Minor">Minor</option>
                    <option value="Serious">Serious</option>
                    <option value="Major">Major</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="subject_context" className="block text-sm font-medium text-gray-700">
                    Subject Context
                  </label>
                  <input
                    id="subject_context"
                    type="text"
                    value={formData.subject_context}
                    onChange={(e) => setFormData({ ...formData, subject_context: e.target.value })}
                    placeholder="e.g., CCS101"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide details about the violation..."
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div className="flex gap-3 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={dismissModal}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-700"
                >
                  Report Violation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
