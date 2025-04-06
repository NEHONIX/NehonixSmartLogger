import React, { useState } from "react";
import { App } from "../../../types/app";
import { appApi, toogleStatusProps } from "../../../services/appApi";
import { formatDate } from "../../../utils/date";
import {
  Power,
  Settings,
  Download,
  Trash2,
  Activity,
  Clock,
  Info,
} from "lucide-react";
import "./AppCard.scss";
import { ButtonLoading } from "../../../utils/buttonLoading";
import { useFecthApps } from "../../../hooks/fetchAppsContext";

interface AppCardProps {
  app: App;
  onDelete: (appId: string) => void;
  onStatusChange: (toogleStatusProps: toogleStatusProps) => void;
  onShowConfig: (appId: string) => void;
  onDetailsClick?: (appId: string) => void;
  showAppActions?: boolean;
}

export const AppCard: React.FC<AppCardProps> = ({
  app,
  onDelete,
  onStatusChange,
  onShowConfig,
  onDetailsClick,
  showAppActions = true,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    setIsButtonLoading: setIsActionsLoading,
    isButtonLoading: isActionsLoading,
  } = useFecthApps();

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
        {showAppActions && (
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
        )}
      </div>

      <div className="app-details" onClick={() => onDetailsClick?.(app.id)}>
        {app.description && <p className="description">{app.description}</p>}
        <div className="metadata">
          <span>
            <Info size={14} />
            ID: {app.id}
          </span>
          <span>
            <Clock size={14} />
            Créé le: {formatDate(app.createdAt)}
          </span>
          {app.lastActivity && (
            <span>
              <Activity size={14} />
              Dernière activité: {formatDate(app.lastActivity)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
