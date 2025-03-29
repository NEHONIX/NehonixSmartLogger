import React from "react";
import { useNavigate } from "react-router-dom";
import "./Unauthorized.scss";

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-content">
        <h1>Accès non autorisé</h1>
        <p>
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <button onClick={() => navigate("/")} className="back-button">
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
};
