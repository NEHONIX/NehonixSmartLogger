import { createContext, useContext, useEffect, useState } from "react";
import { appApi, listAppsProps } from "../services/appApi";
import { App } from "../types/app";

interface FecthAppsContextType {
  apps: App[];
  isLoading: boolean;
  error: string | null;
  fetchApps: (listAppsProps: listAppsProps) => Promise<void>;
  isCreateModalOpen: boolean;
  isButtonLoading: boolean;
  setIsButtonLoading: (isButtonLoading: boolean) => void;
  setIsCreateModalOpen: (isCreateModalOpen: boolean) => void;
  selectedConfig: {
    appId: string;
    config: any;
  } | null;
  setSelectedConfig: (
    selectedConfig: {
      appId: string;
      config: any;
    } | null
  ) => void;
}
export const FecthAppsContext = createContext<FecthAppsContextType | null>(
  null
);

export const FecthAppsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<{
    appId: string;
    config: any;
  } | null>(null);

  const fetchApps = async (listAppsProps: listAppsProps) => {
    try {
      setIsLoading(true);
      const response = await appApi.listApps(listAppsProps);
      setApps(response.apps);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des applications");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApps({ opt: { useCache: true } });
  }, []);

  return (
    <FecthAppsContext.Provider
      value={{
        isButtonLoading,
        setIsButtonLoading,
        apps,
        isLoading,
        error,
        fetchApps,
        isCreateModalOpen,
        setIsCreateModalOpen,
        selectedConfig,
        setSelectedConfig,
      }}
    >
      {children}
    </FecthAppsContext.Provider>
  );
};

export const useFecthApps = () => {
  const context = useContext(FecthAppsContext);
  if (!context) {
    throw new Error("useFecthApps must be used within a FecthAppsProvider");
  }
  return context;
};
