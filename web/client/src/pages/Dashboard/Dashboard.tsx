import React, { useState, useEffect } from "react";
import { App, CreateAppResponse } from "../../types/app";
import { appApi, toogleStatusProps } from "../../services/appApi";
import { AppList } from "../../components/apps/AppList/AppList";
import { CreateAppModal } from "../../components/apps/CreateAppModal/CreateAppModal";
import { ConfigModal } from "../../components/apps/ConfigModal/ConfigModal";
import "./Dashboard.scss";
import { useFecthApps } from "../../hooks/useFetchApps";
import { useActionsLoading } from "../../hooks/useActionsLoading";
import { toast } from "react-toastify";

export const Dashboard: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<{
    appId: string;
    config: any;
  } | null>(null);

  const { apps, isLoading, error, fetchApps } = useFecthApps();
  const { setIsLoading: setIsActionsLoading } = useActionsLoading();

  useEffect(() => {
    fetchApps({ opt: { useCache: true } });
  }, []);

  const handleCreateSuccess = (response: CreateAppResponse) => {
    setIsCreateModalOpen(false);
    fetchApps({ opt: { useCache: false } });
  };

  const handleDeleteApp = async (appId: string) => {
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

  const handleStatusChange = async (toogleStatusProps: toogleStatusProps) => {
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

  const handleShowConfig = async (appId: string) => {
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

  if (isLoading) {
    return <div className="loading">Chargement des applications...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Mes Applications</h1>
        <button
          className="create-button"
          onClick={() => setIsCreateModalOpen(true)}
        >
          Créer une application
        </button>
      </div>

      <AppList
        apps={apps}
        onDelete={handleDeleteApp}
        onStatusChange={handleStatusChange}
        onShowConfig={handleShowConfig}
      />

      <CreateAppModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
        fetchApps={fetchApps}
      />

      {selectedConfig && (
        <ConfigModal
          isOpen={true}
          onClose={() => setSelectedConfig(null)}
          config={selectedConfig.config}
          app={apps.find((app) => app.id === selectedConfig.appId)}
        />
      )}
    </div>
  );
};
