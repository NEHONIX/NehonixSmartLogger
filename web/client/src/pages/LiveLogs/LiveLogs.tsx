import React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { LogViewer } from "../../components/logs/LogViewer";
import { useFecthApps } from "../../hooks/fetchAppsContext";
import { useSetPageTitle } from "../../utils/setPageTitle";
import { NHX_CONFIG } from "../../config/app.conf";
import "./LiveLogs.scss";
import { PageSourceParam } from "../../types/app";
import SideBarComponentMode from "../../components/actions/SideBarComponentMode";
export const LiveLogs: React.FC = () => {
  const { appId } = useParams<{ appId: string }>();
  const { apps, fetchApps, isLoading } = useFecthApps();

  React.useEffect(() => {
    if (!appId) return;
    fetchApps({ opt: { useCache: true } });
  }, [appId]);

  const app = apps.find((app) => app.id === appId);
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("_src") as PageSourceParam;

  useSetPageTitle({
    title: `${NHX_CONFIG._app_info_.__SHORT_NAME}  ●  ${
      app?.name || "Realtime Logs"
    }`,
    description: "Realtime logs viewer",
  });

  if (isLoading) {
    return (
      <div className="live-logs">
        <div className="loading">Loading apps...</div>
      </div>
    );
  }

  if (mode === "sidebar") {
    return (
      <SideBarComponentMode
        message="Select an app to see the logs"
        navigateTo={`${NHX_CONFIG._app_endpoints_._MAIN__.__LOGS__}`}
      />
    );
  }

  if (!appId) {
    return (
      <div className="live-logs">
        <div className="no-app-selected">
          <p>No app selected</p>
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
