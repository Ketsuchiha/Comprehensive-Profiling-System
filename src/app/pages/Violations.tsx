import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, Filter, Search, Users } from "lucide-react";
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

export function Violations() {
  const [violations, setViolations] = useState<ViolationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<(typeof statusOptions)[number]>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

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

  const filteredViolations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return violations;

    return violations.filter((violation) => {
      const haystack = [
        getStudentName(violation),
        violation.student_id,
        violation.violation_type,
        violation.subject_context,
        violation.description,
        violation.severity,
        violation.status,
        violation.reported_by_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [searchQuery, violations]);

  const activeCount = violations.filter((violation) => violation.status === "Active").length;
  const resolvedCount = violations.filter((violation) => violation.status === "Resolved").length;
  const dismissedCount = violations.filter((violation) => violation.status === "Dismissed").length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-gray-900 to-orange-700 px-6 py-8 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-orange-50 backdrop-blur">
                  <AlertTriangle className="h-4 w-4" />
                  Dean oversight
                </div>
                <h1 className="text-3xl font-semibold text-white sm:text-4xl">Student Violations</h1>
                <p className="mt-2 max-w-2xl text-sm text-orange-50/90 sm:text-base">
                  Review conduct records, monitor active cases, and look up violations by student, type, or status.
                </p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white backdrop-blur">
                <p className="text-sm text-orange-50/80">Total Records</p>
                <p className="text-3xl font-semibold">{violations.length.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 border-t border-gray-200 bg-gray-50 px-6 py-5 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="mt-1 text-2xl font-semibold text-orange-600">{activeCount}</p>
                </div>
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Resolved</p>
                  <p className="mt-1 text-2xl font-semibold text-green-600">{resolvedCount}</p>
                </div>
                <CalendarDays className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Dismissed</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-700">{dismissedCount}</p>
                </div>
                <Users className="h-5 w-5 text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Filter Records</h2>
            <p className="mt-1 text-sm text-gray-600">Search by student name, violation type, status, or reporter.</p>
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
                  placeholder="Student, type, status, or reporter"
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

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 sm:flex sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Violation Records</h2>
              <p className="mt-1 text-sm text-gray-600">
                {loading
                  ? "Loading records..."
                  : `${filteredViolations.length} record${filteredViolations.length === 1 ? "" : "s"}`}
              </p>
            </div>
            <div className="mt-3 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 sm:mt-0">
              /api/violations
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Violation</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Reported By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-orange-500"></div>
                        <span>Loading violations...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredViolations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <AlertTriangle className="h-8 w-8 text-gray-400" />
                        <p className="text-sm font-medium text-gray-700">No violations found</p>
                        <p className="text-xs text-gray-500">
                          Try a different search term or status filter.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredViolations.map((violation) => (
                    <tr key={violation.violation_id} className="hover:bg-gray-50/50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{getStudentName(violation)}</p>
                          <p className="text-xs text-gray-500">{violation.student_id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="font-medium text-gray-900">{violation.violation_type}</p>
                          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                            {violation.description || violation.subject_context || "—"}
                          </p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getSeverityStyles(violation.severity)}`}>
                          {violation.severity || "Warning"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusStyles(violation.status)}`}>
                          {violation.status || "Active"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{formatDate(violation.incident_date)}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{violation.reported_by_name || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
