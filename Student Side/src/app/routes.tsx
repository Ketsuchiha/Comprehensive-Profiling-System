import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AcademicProfile from "./pages/AcademicProfile";
import AcademicRecords from "./pages/AcademicRecords";
import Activities from "./pages/Activities";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "profile", Component: Profile },
      { path: "academic-profile", Component: AcademicProfile },
      { path: "academic-records", Component: AcademicRecords },
      { path: "activities", Component: Activities },
    ],
  },
]);
