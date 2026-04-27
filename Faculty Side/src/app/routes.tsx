import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Subjects from "./pages/Subjects";
import Modules from "./pages/Modules";
import Schedule from "./pages/Schedule";
import AssignedClasses from "./pages/AssignedClasses";
import TeachingUnits from "./pages/TeachingUnits";
import ResearchOutputs from "./pages/ResearchOutputs";
import AuthoredSyllabi from "./pages/AuthoredSyllabi";
import StudentGrading from "./pages/StudentGrading";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: Dashboard },
      { path: "profile", Component: Profile },
      { path: "subjects", Component: Subjects },
      { path: "modules", Component: Modules },
      { path: "schedule", Component: Schedule },
      { path: "assigned-classes", Component: AssignedClasses },
      { path: "student-grading", Component: StudentGrading },
      { path: "teaching-units", Component: TeachingUnits },
      { path: "research-outputs", Component: ResearchOutputs },
      { path: "authored-syllabi", Component: AuthoredSyllabi },
    ],
  },
]);
