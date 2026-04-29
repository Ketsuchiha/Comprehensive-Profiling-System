import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Filter, Search, Eye } from "lucide-react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";

interface ViolationRecord {
  violation_id: number;
  student_id: string;
  violation_type: string;
  subject_context: string | null;
  description: string | null;
  severity: string | null;
  status: string | null;
  incident_date: string;
  reported_by: string | null;
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
    case "Warning":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-green-100 text-green-700 border-green-200";
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

export default function MyViolations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [violations, setViolations] = useState<ViolationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<(typeof statusOptions)[number]>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.refId) {
      setLoading(false);
      setError("No student ID found for this session.");
      return;
    }

    let isMounted = true;

    const fetchViolations = async () => {
      setLoading(true);
      setError("");

      try {
        const rows = await api.get<ViolationRecord[]>(
          `/students/${encodeURIComponent(user.refId)}/violations`
        );
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
  }, [user?.refId]);

  const filteredViolations = useMemo(() => {
    let filtered = violations;

    // Filter by status
    if (selectedStatus !== "All") {
      filtered = filtered.filter((v) => v.status === selectedStatus);
    }

    // Filter by search query
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      filtered = filtered.filter((violation) => {
        const type = violation.violation_type?.toLowerCase() || "";
        const subject = violation.subject_context?.toLowerCase() || "";
        const description = violation.description?.toLowerCase() || "";
        const reporter = violation.reported_by?.toLowerCase() || "";

        return (
          type.includes(query) ||
          subject.includes(query) ||
          description.includes(query) ||
          reporter.includes(query)
        );
      });
    }

    return filtered;
  }, [violations, selectedStatus, searchQuery]);

  const activeCount = violations.filter((v) => v.status === "Active").length;
  const resolvedCount = violations.filter((v) => v.status === "Resolved").length;
  const dismissedCount = violations.filter((v) => v.status === "Dismissed").length;

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-8 w-8 text-orange-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Violations</h1>
          <p className="mt-1 text-gray-600">View and track your academic violations.</p>
        </div>
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
      {violations.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Filter Records</h2>
            <p className="mt-1 text-sm text-gray-600">Search by violation type, subject, or reporter.</p>
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
                  placeholder="Violation type, subject, or reporter"
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
      )}

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

        {!loading && !error && violations.length === 0 && (
          <div className="py-12 text-center">
            <div className="rounded-full bg-green-100 p-4 mx-auto w-fit">
              <svg className="h-12 w-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="mt-4 text-gray-600">Great! You have no violations.</p>
          </div>
        )}

        {!loading && filteredViolations.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Violation Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Description</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Severity</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Reported By</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredViolations.map((violation) => (
                  <tr key={violation.violation_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{violation.violation_type}</p>
                      <p className="text-xs text-gray-500">{violation.subject_context || "N/A"}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{violation.description || "No description"}</td>
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
                    <td className="px-4 py-3 text-gray-600">{formatDate(violation.incident_date)}</td>
                    <td className="px-4 py-3 text-gray-600">{violation.reported_by || "System"}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/my-violations/${violation.violation_id}`)}
                        className="flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && violations.length > 0 && filteredViolations.length === 0 && (
          <div className="py-12 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-gray-600">No violations match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
