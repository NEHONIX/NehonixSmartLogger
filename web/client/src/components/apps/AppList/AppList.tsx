import React from "react";
import { App } from "../../../types/app";
import { AppCard } from "../AppCard/AppCard";
import "./AppList.scss";
import { toogleStatusProps } from "../../../services/appApi";
interface AppListProps {
  apps: App[];
  onDelete: (appId: string) => void;
  onStatusChange: (toogleStatusProps: toogleStatusProps) => void;
  onShowConfig: (appId: string) => void;
}

export const AppList: React.FC<AppListProps> = ({
  apps,
  onDelete,
  onStatusChange,
  onShowConfig,
}) => {
  if (Array.isArray(apps) && apps?.length === 0) {
    return (
      <div className="empty-state">
        <p>Aucune application n'a été créée pour le moment.</p>
        <p>Clique sur le bouton "Créer une application" pour commencer !</p>
      </div>
    );
  }

  return (
    <div className="app-list">
      {apps?.map((app) => (
        <AppCard
          key={app.id}
          app={app}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          onShowConfig={onShowConfig}
        />
      ))}
    </div>
  );
};
