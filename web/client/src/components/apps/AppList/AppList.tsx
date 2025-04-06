import { AppCard } from "../AppCard/AppCard";
import "./AppList.scss";
import { appApi, toogleStatusProps } from "../../../services/appApi";
import { useFecthApps } from "../../../hooks/fetchAppsContext";
import { toast } from "react-toastify";
import { NHX_CONFIG } from "../../../config/app.conf";
import { useNavigate } from "react-router-dom";
// interface AppListProps {

// }
interface AppListProps {
  onDetailsClick?: (appId: string) => void;
  showAppActions?: boolean;
}
export const AppList = ({
  onDetailsClick: onDetailsClickProps,
  showAppActions = true,
}: AppListProps) => {
  const { setIsButtonLoading: setIsActionsLoading } = useFecthApps();
  const { apps, fetchApps, setSelectedConfig } = useFecthApps();
  const navigate = useNavigate();

  if (Array.isArray(apps) && apps?.length === 0) {
    return (
      <div className="empty-state">
        <p>Aucune application n'a été créée pour le moment.</p>
        <p>Clique sur le bouton "Créer une application" pour commencer !</p>
      </div>
    );
  }

  const onDelete = async (appId: string) => {
    setIsActionsLoading(true);
    if (
      window.confirm("Etes-vous sûr de vouloir supprimer cette application ?")
    ) {
      try {
        await appApi.deleteApp(appId);
        fetchApps({ opt: { useCache: false } });
      } catch (err) {
        console.error("Erreur lors de la suppression:", err);
      } finally {
        setIsActionsLoading(false);
      }
    }
  };

  const onStatusChange = async (toogleStatusProps: toogleStatusProps) => {
    setIsActionsLoading(true);
    try {
      const res = (await appApi.toggleAppStatus(toogleStatusProps)).data;
      fetchApps({ opt: { useCache: false } });
      toast.success(res.message);
    } catch (err: any) {
      toast.error(err.response.data.message);
    } finally {
      setIsActionsLoading(false);
    }
  };

  const onShowConfig = async (appId: string) => {
    setIsActionsLoading(true);
    try {
      const response = await appApi.downloadConfig(appId);
      const text = await response.text();
      const config = JSON.parse(text);
      console.log("config response: ", config);
      setSelectedConfig({ appId, config });
    } catch (err) {
      console.error("Erreur lors de la récupération de la configuration:", err);
    } finally {
      setIsActionsLoading(false);
    }
  };

  const onDetailsClick = (appId: string) => {
    navigate(`${NHX_CONFIG._app_endpoints_._MAIN__.__ANALYTICS__}/${appId}`);
  };

  return (
    <div className="app-list">
      {apps?.map((app) => (
        <AppCard
          key={app.id}
          app={app}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          onShowConfig={onShowConfig}
          onDetailsClick={onDetailsClickProps || onDetailsClick}
          showAppActions={showAppActions}
        />
      ))}
    </div>
  );
};
