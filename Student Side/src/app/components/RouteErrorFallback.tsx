import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router";

export default function RouteErrorFallback() {
  const error = useRouteError();
  const navigate = useNavigate();

  let title = "Something went wrong";
  let message = "An unexpected error happened while loading this page.";

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`.trim();
    if (typeof error.data === "string" && error.data.trim()) {
      message = error.data;
    } else if (error.status === 404) {
      message = "The page you are looking for was not found.";
    }
  } else if (error instanceof Error && error.message.trim()) {
    message = error.message;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            Go to Dashboard
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}
