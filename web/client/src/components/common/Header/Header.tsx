import React from "react";
import { useLocation } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../../hooks/useTheme";
import "./Header.scss";
import { NHX_CONFIG } from "../../../config/app.conf";
export const Header: React.FC = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const getPageTitle = () => {
    switch (location.pathname) {
      case NHX_CONFIG._app_endpoints_._MAIN__.__DASHBOARD__:
        return "Tableau de bord";
      case NHX_CONFIG._app_endpoints_._MAIN__.__LOGS__:
        return "Logs en direct";
      case NHX_CONFIG._app_endpoints_._MAIN__.__ANALYTICS__:
        return "Analyses";
      default:
        return "Nehonix Logger";
    }
  };

  return (
    <header className="header">
      <div className="header__logo">
        <h1>{NHX_CONFIG._app_info_.__NAME__}</h1>
      </div>
      <div className="header__title">
        <h2>{getPageTitle()}</h2>
      </div>
      <div className="header__actions">
        <div className="header__connection-status">
          <span className="status-dot connected" />
          Connecté au serveur
        </div>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Activer le mode ${
            theme === "light" ? "sombre" : "clair"
          }`}
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>
    </header>
  );
};
