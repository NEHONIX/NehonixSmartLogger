import React, { useState } from "react";
import { App } from "../../../types/app";
import { appApi, toogleStatusProps } from "../../../services/appApi";
import { formatDate } from "../../../utils/date";
import { Power, Settings, Download, Trash2 } from "lucide-react";
import "./AppCard.scss";
import { useActionsLoading } from "../../../hooks/useActionsLoading";
import { ButtonLoading } from "../../../utils/buttonLoading";
import { useNavigate } from "react-router-dom";
import { NHX_CONFIG } from "../../../config/app.conf";
interface AppCardProps {
  app: App;
  onDelete: (appId: string) => void;
  onStatusChange: (toogleStatusProps: toogleStatusProps) => void;
  onShowConfig: (appId: string) => void;
}

export const AppCard: React.FC<AppCardProps> = ({
  app,
  onDelete,
  onStatusChange,
  onShowConfig,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setIsLoading: setIsActionsLoading, isLoading: isActionsLoading } =
    useActionsLoading();

  const handleDownloadConfig = async () => {
    setIsActionsLoading(true);

    try {
      const blob = await appApi.downloadConfig(app.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nehonix-config-${app.name.toLowerCase()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
    } finally {
      setIsLoading(false);
      setIsActionsLoading(false);
    }
  };

  return (
    <div className="app-card">
      <div className="app-header">
        <div className="app-info">
          <h3>{app.name}</h3>
          <span className={`status-badge ${app.status}`}>
            {app.status === "active" ? "Actif" : "Inactif"}
          </span>
        </div>
        <div className="app-actions">
          {isActionsLoading ? (
            <ButtonLoading />
          ) : (
            <button
              className="action-button"
              onClick={() =>
                onStatusChange({
                  appId: app.id,
                  status: app.status === "active" ? "inactive" : "active",
                })
              }
              title={app.status === "active" ? "Désactiver" : "Activer"}
            >
              <Power
                className={`icon ${
                  app.status === "active" ? "active" : "inactive"
                }`}
              />
            </button>
          )}

          {isActionsLoading ? (
            <ButtonLoading />
          ) : (
            <button
              className="action-button"
              onClick={() => onShowConfig(app.id)}
              title="Voir la configuration"
            >
              <Settings className="icon" />
            </button>
          )}

          {isActionsLoading ? (
            <ButtonLoading />
          ) : (
            <button
              className="action-button"
              onClick={handleDownloadConfig}
              disabled={isLoading}
              title="Télécharger la configuration"
            >
              <Download className="icon" />
            </button>
          )}

          {isActionsLoading ? (
            <ButtonLoading />
          ) : (
            <button
              className="action-button delete"
              onClick={() => onDelete(app.id)}
              title="Supprimer"
            >
              <Trash2 className="icon" />
            </button>
          )}
        </div>
      </div>

      <div
        className="app-details"
        onClick={() =>
          navigate(
            `${NHX_CONFIG._app_endpoints_._MAIN__.__ANALYTICS__}/${app.id}`
          )
        }
      >
        {app.description && <p className="description">{app.description}</p>}
        <div className="metadata">
          <span>ID: {app.id}</span>
          <span>Créé le: {formatDate(app.createdAt)}</span>
          {app.lastActivity && (
            <span>Dernière activité: {formatDate(app.lastActivity)}</span>
          )}
          {app.description && (
            <span>
              Description:{" "}
              {app.description.length > 100
                ? app.description.slice(0, 100) + "..."
                : app.description}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
