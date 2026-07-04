import { Routes, Route } from "react-router-dom";

import Login from "../../../pages/auth/Login";
import Signup from "../../../pages/auth/Signup";
import Dashboard from "../../../pages/dashboard/Dashboard";

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

function AppRoutes() {
  return (
    <Routes>

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default AppRoutes;