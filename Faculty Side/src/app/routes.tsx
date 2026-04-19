import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Login from "./pages/Login";

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
    ],
  },
]);
