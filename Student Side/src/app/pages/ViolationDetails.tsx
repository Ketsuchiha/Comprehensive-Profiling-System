import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, AlertTriangle } from "lucide-react";
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

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
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

export default function ViolationDetails() {
  const { violationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [violation, setViolation] = useState<ViolationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.refId || !violationId) {
      setLoading(false);
      setError("Missing required information");
      return;
    }

    let isMounted = true;

    const fetchViolationDetails = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await api.get<ViolationRecord>(
          `/students/${encodeURIComponent(user.refId)}/violations/${encodeURIComponent(violationId)}`
        );
        if (!isMounted) return;
        setViolation(data);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load violation details.");
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    fetchViolationDetails();

    return () => {
      isMounted = false;
    };
  }, [user?.refId, violationId]);

  if (loading) {
    return (
      <div className="space-y-6 p-8">
        <button
          onClick={() => navigate("/my-violations")}
          className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Violations
        </button>
        <div className="py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-orange-500"></div>
          <p className="mt-4 text-gray-600">Loading violation details...</p>
        </div>
      </div>
    );
  }

  if (error || !violation) {
    return (
      <div className="space-y-6 p-8">
        <button
          onClick={() => navigate("/my-violations")}
          className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Violations
        </button>
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error || "Violation not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/my-violations")}
          className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Violations
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="rounded-full bg-orange-100 p-3">
          <AlertTriangle className="h-6 w-6 text-orange-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Violation Details</h1>
          <p className="mt-1 text-gray-600">Full information about your violation report</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Violation Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-600">Violation Type</p>
                  <p className="mt-2 text-lg font-semibold text-gray-900">
                    {violation.violation_type}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">Severity</p>
                  <div className="mt-2">
                    <Badge className={`border ${getSeverityStyles(violation.severity)} text-base py-1 px-3`}>
                      {violation.severity || "Unknown"}
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <div className="mt-2">
                    <Badge className={`border ${getStatusStyles(violation.status)} text-base py-1 px-3`}>
                      {violation.status || "Unknown"}
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">Subject Context</p>
                  <p className="mt-2 text-lg text-gray-900">
                    {violation.subject_context || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">Incident Date</p>
                  <p className="mt-2 text-lg text-gray-900">
                    {formatDate(violation.incident_date)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">Reported By</p>
                  <p className="mt-2 text-lg text-gray-900">
                    {violation.reported_by || "System"}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Description</p>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {violation.description || "No description provided"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Card */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-orange-50 p-4 border border-orange-100">
                <p className="text-sm font-medium text-orange-800">Violation ID</p>
                <p className="mt-1 text-lg font-mono text-orange-900">
                  {violation.violation_id}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
                <p className="text-sm font-medium text-gray-700">Student ID</p>
                <p className="mt-1 text-lg font-mono text-gray-900">
                  {violation.student_id}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
                <p className="text-sm font-medium text-gray-700">Report Date & Time</p>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDateTime(violation.incident_date)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Status Info */}
          <Card>
            <CardHeader>
              <CardTitle>Status Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {violation.status === "Active" && (
                  <div className="rounded-lg bg-orange-50 p-3 border border-orange-100">
                    <p className="text-sm text-orange-800">
                      This violation is currently <strong>active</strong>. Please review the details and take any necessary action.
                    </p>
                  </div>
                )}
                {violation.status === "Resolved" && (
                  <div className="rounded-lg bg-green-50 p-3 border border-green-100">
                    <p className="text-sm text-green-800">
                      This violation has been <strong>resolved</strong>. The matter has been addressed.
                    </p>
                  </div>
                )}
                {violation.status === "Dismissed" && (
                  <div className="rounded-lg bg-gray-50 p-3 border border-gray-200">
                    <p className="text-sm text-gray-800">
                      This violation has been <strong>dismissed</strong>.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
