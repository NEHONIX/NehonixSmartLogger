import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { UserTarget } from "../../../types/auth";
import "./ProtectedRoute.scss";
import { NHX_CONFIG } from "../../../config/app.conf";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedTargets?: UserTarget[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedTargets,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Chargement...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Rediriger vers la page de connexion avec le retour à la page précédente
    return (
      <Navigate
        to={NHX_CONFIG._app_endpoints_.__AUTH__.__LOGIN__}
        state={{ from: location }}
        replace
      />
    );
  }

  // Vérifier si l'utilisateur a le bon type pour accéder à la route
  if (allowedTargets && user && !allowedTargets.includes(user.target)) {
    // console.log("user is not allowed to access this route");
    return (
      <Navigate
        to={NHX_CONFIG._app_endpoints_.__OTHER__.__UNAUTHORIZED__}
        replace
      />
    );
  }

  return <>{children}</>;
};
