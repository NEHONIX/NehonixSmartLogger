import { useEffect } from "react";
import { NHX_CONFIG } from "../config/app.conf";
import { useLocation } from "react-router-dom";

export const useSetPageTitle = (options?: {
  title?: string;
  description?: string;
}) => {
  const location = useLocation();
  useEffect(() => {
    switch (location.pathname) {
      case NHX_CONFIG._app_endpoints_._MAIN__.__DASHBOARD__:
        document.title = options?.title || "Tableau de bord";
        document
          .querySelector("meta[name='description']")
          ?.setAttribute("content", options?.description || "Tableau de bord");
        break;
      case NHX_CONFIG._app_endpoints_._MAIN__.__LOGS__:
        document.title = options?.title || "Live Logs";
        document
          .querySelector("meta[name='description']")
          ?.setAttribute("content", options?.description || "Live Logs");
        break;
      case NHX_CONFIG._app_endpoints_._MAIN__.__ANALYTICS__:
        document.title = options?.title || "Analyses";
        document
          .querySelector("meta[name='description']")
          ?.setAttribute("content", options?.description || "Analyses");
        break;
      default:
        document.title = options?.title || "Nehonix Logger";
        document
          .querySelector("meta[name='description']")
          ?.setAttribute("content", options?.description || "Nehonix Logger");
    }
  }, [location.pathname, options?.title, options?.description]);
};
