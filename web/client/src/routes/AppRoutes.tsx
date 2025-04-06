import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Login } from "../pages/auth/Login";
import { Register } from "../pages/auth/Register";
import { Dashboard } from "../pages/Dashboard/Dashboard";
import { LiveLogs } from "../pages/LiveLogs/LiveLogs";
import Analytics from "../pages/Analytics/Analytics";
import { Unauthorized } from "../pages/Unauthorized/Unauthorized";
import { ProtectedLayout } from "../components/common/ProtectedLayout/ProtectedLayout";
import { NHX_CONFIG } from "../config/app.conf";
import { useSetPageTitle } from "../utils/setPageTitle";
import { ProtectedRoute } from "../components/common/ProtectedRoute/ProtectedRoute";
import NotFound from "../pages/NotFound/NotFound";

export const AppRoutes: React.FC = () => {
  useSetPageTitle();
  return (
    <Routes>
      {/* Redirection de la racine vers dashboard */}
      <Route
        path="/app"
        element={
          <Navigate
            to={NHX_CONFIG._app_endpoints_._MAIN__.__DASHBOARD__}
            replace
          />
        }
      />
      <Route
        path="/"
        element={
          <Navigate
            to={NHX_CONFIG._app_endpoints_._MAIN__.__DASHBOARD__}
            replace
          />
        }
      />

      {/* Routes publiques */}
      <Route
        path={NHX_CONFIG._app_endpoints_.__AUTH__.__LOGIN__}
        element={<Login />}
      />
      <Route
        path={NHX_CONFIG._app_endpoints_.__AUTH__.__REGISTER__}
        element={<Register />}
      />
      <Route
        path={NHX_CONFIG._app_endpoints_.__OTHER__.__UNAUTHORIZED__}
        element={<Unauthorized />}
      />

      {/* Routes protégées avec layout */}
      <Route
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Outlet />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      >
        <Route
          path={NHX_CONFIG._app_endpoints_._MAIN__.__DASHBOARD__}
          element={<Dashboard />}
        />

        <Route
          path={NHX_CONFIG._app_endpoints_._MAIN__.__ANALYTICS__}
          element={<Analytics />}
        />
        <Route
          path={NHX_CONFIG._app_endpoints_._MAIN__.__LOGS__}
          element={<LiveLogs />}
        />
      </Route>

      {/* Routes protégées sans layout */}
      <Route
        path={`${NHX_CONFIG._app_endpoints_._MAIN__.__ANALYTICS__}/:appId`}
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${NHX_CONFIG._app_endpoints_._MAIN__.__LOGS__}/:appId`}
        element={
          <ProtectedRoute>
            <LiveLogs />
          </ProtectedRoute>
        }
      />

      {/* Route 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
