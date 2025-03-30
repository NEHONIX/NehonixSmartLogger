import React from "react";
import { useLocation } from "react-router-dom";
import { ProtectedRoute } from "../ProtectedRoute/ProtectedRoute";
import { Layout } from "../Layout/Layout";
import { routePermissions } from "../../../routes/routePermissions";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({
  children,
}) => {
  const location = useLocation();
  const path = location.pathname;
  const allowedTargets = routePermissions[path];

  return (
    <ProtectedRoute allowedTargets={allowedTargets}>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
};
