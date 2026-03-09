import { createBrowserRouter } from "react-router";
import { Dashboard } from "./pages/Dashboard";
import { StudentProfile } from "./pages/StudentProfile";
import { FacultyProfile } from "./pages/FacultyProfile";
import { Events } from "./pages/Events";
import { Scheduling } from "./pages/Scheduling";
import { CollegeResearch } from "./pages/CollegeResearch";
import { Instruments } from "./pages/Instruments";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
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
      { path: "students", Component: StudentProfile },
      { path: "faculty", Component: FacultyProfile },
      { path: "events", Component: Events },
      { path: "scheduling", Component: Scheduling },
      { path: "research", Component: CollegeResearch },
      { path: "instruments", Component: Instruments },
    ],
  },
]);