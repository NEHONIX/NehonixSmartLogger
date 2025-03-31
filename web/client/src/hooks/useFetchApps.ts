import { useState } from "react";
import { appApi, listAppsProps } from "../services/appApi";
import { App } from "../types/app";

export const useFecthApps = () => {
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return { apps, isLoading, error, fetchApps };
};
