import React from "react";
import { useParams } from "react-router-dom";
import { LogViewer } from "../../components/logs/LogViewer";
import { useFecthApps } from "../../hooks/useFetchApps";
import { useSetPageTitle } from "../../utils/setPageTitle";
import { NHX_CONFIG } from "../../config/app.conf";
import "./LiveLogs.scss";

export const LiveLogs: React.FC = () => {
  const { appId } = useParams<{ appId: string }>();
  const { apps, fetchApps, isLoading } = useFecthApps();

  React.useEffect(() => {
    if (!appId) return;
    fetchApps({ opt: { useCache: true } });
  }, [appId]);

  const app = apps.find((app) => app.id === appId);

  useSetPageTitle({
    title: `${NHX_CONFIG._app_info_.__SHORT_NAME}  ●  ${
      app?.name || "Realtime Logs"
    }`,
    description: "Realtime logs viewer",
  });

  if (isLoading) {
    return (
      <div className="live-logs">
        <div className="loading">Chargement des applications...</div>
      </div>
    );
  }

  if (!appId) {
    return (
      <div className="live-logs">
        <div className="no-app-selected">
          <p>Aucune application sélectionnée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="live-logs">
      <LogViewer appId={appId} />
    </div>
  );
};
