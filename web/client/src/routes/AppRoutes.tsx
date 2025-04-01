import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "../pages/auth/Login";
import { Register } from "../pages/auth/Register";
import { Dashboard } from "../pages/Dashboard/Dashboard";
import { LiveLogs } from "../pages/LiveLogs/LiveLogs";
import Analytics from "../pages/Analytics/Analytics";
import { Unauthorized } from "../pages/Unauthorized/Unauthorized";
import { ProtectedLayout } from "../components/common/ProtectedLayout/ProtectedLayout";
import { NHX_CONFIG } from "../config/app.conf";
import { BtnActionsLoadingProvider } from "../hooks/useActionsLoading";
import { useSetPageTitle } from "../utils/setPageTitle";
import { ProtectedRoute } from "../components/common/ProtectedRoute/ProtectedRoute";

export const AppRoutes: React.FC = () => {
  useSetPageTitle();
  return (
    <Routes>
      {/* Redirection de la racine vers dashboard */}
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

      {/* Routes protégées */}
      <Route
        path={`${NHX_CONFIG._app_endpoints_._MAIN__.__ANALYTICS__}/:appId`}
        element={
          <ProtectedRoute>
            <BtnActionsLoadingProvider>
              <Analytics />
            </BtnActionsLoadingProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${NHX_CONFIG._app_endpoints_._MAIN__.__LOGS__}/:appId`}
        element={
          <ProtectedRoute>
            <BtnActionsLoadingProvider>
              <LiveLogs />
            </BtnActionsLoadingProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/*"
        element={
          <ProtectedLayout>
            <Routes>
              <Route
                path={NHX_CONFIG._app_endpoints_._MAIN__.__DASHBOARD__}
                element={
                  <BtnActionsLoadingProvider>
                    <Dashboard />
                  </BtnActionsLoadingProvider>
                }
              />

              <Route
                path={NHX_CONFIG._app_endpoints_._MAIN__.__ANALYTICS__}
                element={
                  <BtnActionsLoadingProvider>
                    <Analytics />
                  </BtnActionsLoadingProvider>
                }
              />
            </Routes>
          </ProtectedLayout>
        }
      />
    </Routes>
  );
};
