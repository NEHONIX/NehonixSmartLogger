import React from "react";
import { Routes, Route } from "react-router-dom";
import { Login } from "../pages/auth/Login";
import { Register } from "../pages/auth/Register";
import { Dashboard } from "../pages/Dashboard/Dashboard";
import { LiveLogs } from "../pages/LiveLogs/LiveLogs";
import { Unauthorized } from "../pages/Unauthorized/Unauthorized";
import { ProtectedRoute } from "../components/common/ProtectedRoute/ProtectedRoute";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Routes protégées */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
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

      <Route
        path="/logs"
        element={
          <ProtectedRoute allowedTargets={["dev", "entreprise"]}>
            <LiveLogs />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};
