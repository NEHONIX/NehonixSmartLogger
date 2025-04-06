import React from "react";
import { CreateAppResponse } from "../../types/app";
import { AppList } from "../../components/apps/AppList/AppList";
import { CreateAppModal } from "../../components/apps/CreateAppModal/CreateAppModal";
import { ConfigModal } from "../../components/apps/ConfigModal/ConfigModal";
import "./Dashboard.scss";
import { useFecthApps } from "../../hooks/fetchAppsContext";
import ErrorDisplay from "../../components/common/ErrorDisplay/ErrorDisplay";

export const Dashboard: React.FC = () => {
  const {
    isLoading,
    error,
    isCreateModalOpen,
    setIsCreateModalOpen,
    selectedConfig,
    setSelectedConfig,
    fetchApps,
    apps,
  } = useFecthApps();

  const handleCreateSuccess = (response: CreateAppResponse) => {
    setIsCreateModalOpen(false);
    fetchApps({ opt: { useCache: false } });
  };

  if (isLoading) {
    return <div className="loading">Chargement des applications...</div>;
  }

  if (error) {
    return <ErrorDisplay type="FETCH_ERR" message={error} />;
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

      <AppList />

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
