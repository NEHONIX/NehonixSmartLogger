import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  PerformanceMetrics,
  LogEntry,
  Anomaly,
  TimeRange,
} from "../../types/app";
import { appApi } from "../../services/appApi";
import MetricsChart from "../../components/analytics/MetricsChart/MetricsChart";
import PerformanceOverview from "../../components/analytics/PerformanceOverview/PerformanceOverview";
import { AnomalyDetection } from "../../components/analytics/AnomalyDetection/AnomalyDetection";
import LogOverview from "../../components/analytics/LogOverview/LogOverview";
import "./Analytics.scss";
import { useFecthApps } from "../../hooks/useFetchApps";
import { useWebSocket } from "../../hooks/useWebSocket";
import { NHX_CONFIG } from "../../config/app.conf";
import { useAuth } from "../../contexts/AuthContext";
import { useSetPageTitle } from "../../utils/setPageTitle";
import ErrorDisplay from "../../components/common/ErrorDisplay/ErrorDisplay";

const Analytics: React.FC = () => {
  const { appId } = useParams<{ appId: string }>();
  const [metricsData, setMetricsData] = useState<
    Array<{
      timestamp: string;
      cpu: number;
      memory: number;
      requests: number;
    }>
  >([]);
  const [timeRange, setTimeRange] = useState<TimeRange>({
    start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString(),
    type: "day",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{
    type: "AUTH_ERR" | "WS_ERR" | "APP_ERR" | "FETCH_ERR" | "UNKNOWN_ERR";
    message: string;
  } | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const { apps, fetchApps, isLoading: isLoadingApps } = useFecthApps();
  const { user } = useAuth();
  const [appStatus, setAppStatus] = useState<{
    isActive: boolean;
    lastUpdate: string;
  }>({ isActive: false, lastUpdate: new Date().toISOString() });

  // Connexion WebSocket avec gestion des métriques et du statut
  const {
    isConnected,
    setFilters,
    sendCommand,
    isAuthenticated,
    checkStatus,
    reconnect,
  } = useWebSocket({
    wsUrl: NHX_CONFIG._global_.__WEBSOCKET_URL__,
    appId: appId || "",
    userId: user?.uid || "",
    onAuthSuccess() {
      // Réinitialiser les erreurs lors d'une authentification réussie
      setError(null);
      // Vérifier immédiatement le statut après l'authentification
      checkStatus();
    },
    onStatusResponse(status) {
      console.log("status: ", status);
      if (!status.payload.success) {
        setError({
          type: "APP_ERR",
          message: status.payload.message || "L'application est inactive",
        });
        return;
      }

      // Ne réinitialiser l'erreur que si le statut est un succès
      if (status.payload.status.appIsActive) {
        setError(null);
      } else {
        setError({
          type: "APP_ERR",
          message: "L'application est actuellement inactive",
        });
      }

      // Mise à jour du statut en temps réel
      setAppStatus({
        isActive: status.payload.status.appIsActive,
        lastUpdate: new Date().toISOString(),
      });
    },
    onAuthError(error) {
      setError({
        type: "AUTH_ERR",
        message: error || "Erreur d'authentification",
      });
    },
    onConnectionError(error) {
      setError({
        type: "WS_ERR",
        message: error || "Erreur de connexion au serveur",
      });
    },
    onLogs: (newLogs) => {
      console.log("new logs: ", newLogs);
      setLogs((prev) => {
        const updatedLogs = [...prev, ...newLogs];
        // Limiter à 1000 logs pour la performance
        return updatedLogs.slice(-1000);
      });
    },
    onMetrics: (newMetrics) => {
      const timestamp = new Date().toISOString();
      setMetricsData((prev) => {
        const newData = [
          ...prev,
          {
            timestamp,
            cpu: newMetrics.cpu?.usage ?? 0,
            memory: newMetrics.memory
              ? (newMetrics.memory.used / newMetrics.memory.total) * 100
              : 0,
            requests:
              newMetrics.network?.interfaces?.[
                Object.keys(newMetrics.network.interfaces)[0]
              ]?.packetsReceived ?? 0,
          },
        ];
        // Garder seulement les dernières 60 minutes de données pour "hour",
        // 144 points pour "day" (10 minutes d'intervalle),
        // ou 168 points pour "week" (1 heure d'intervalle)
        const maxPoints =
          timeRange.type === "hour" ? 60 : timeRange.type === "day" ? 144 : 168;
        return newData.slice(-maxPoints);
      });
      setLoading(false);
    },
  });

  useEffect(() => {
    if (!appId) return;
    fetchApps({ opt: { useCache: true } });
  }, [appId]);

  const app = apps.find((app) => app.id === appId);

  useSetPageTitle({
    title: `  Real-time analytics  ●  ${app?.name || "U"} `,
    description: "Analyse des performances de l'application",
  });

  // Demander les métriques via WebSocket
  useEffect(() => {
    if (isConnected && appId) {
      // Demander les métriques en temps réel
      sendCommand({
        type: "get_metrics",
        data: {
          timeRange: timeRange.type,
        },
      });
    }
  }, [isConnected, appId, timeRange.type, sendCommand]);

  // Mise à jour des filtres WebSocket
  useEffect(() => {
    if (appId) {
      setFilters({ appId });
    }
  }, [appId, setFilters]);

  // Vérifier le statut de connexion
  useEffect(() => {
    if (!isConnected) {
      setError({
        type: "WS_ERR",
        message: "Connection to server lost",
      });
    }
  }, [isConnected]);

  // Vérifier périodiquement le statut
  useEffect(() => {
    const statusCheckInterval = setInterval(() => {
      if (isConnected && isAuthenticated) {
        checkStatus();
      }
    }, 10000); // Vérifier toutes les 10 secondes

    return () => clearInterval(statusCheckInterval);
  }, [isConnected, isAuthenticated, checkStatus]);

  const handleTimeRangeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    // Vérifier le statut avant de changer la plage de temps
    checkStatus();

    const newType = event.target.value as TimeRange["type"];
    const now = new Date();
    let start = new Date();

    switch (newType) {
      case "hour":
        start.setHours(now.getHours() - 1);
        break;
      case "day":
        start.setDate(now.getDate() - 1);
        break;
      case "week":
        start.setDate(now.getDate() - 7);
        break;
    }

    setTimeRange({
      start: start.toISOString(),
      end: now.toISOString(),
      type: newType,
    });
  };

  if (appId && isLoadingApps) {
    return <div>Fetching apps...</div>;
  }

  if (!appId) {
    return (
      <div className="analytics">
        <div className="analytics-content">
          <div className="no-app-selected">
            <p>No app selected</p>
          </div>
        </div>
      </div>
    );
  }

  if (error?.type) {
    return (
      <ErrorDisplay
        type={error.type}
        message={error.message}
        onRetry={error.type === "AUTH_ERR" ? reconnect : undefined}
      />
    );
  }

  return (
    <div className="analytics">
      <div className="analytics-header">
        <span style={{ color: appStatus.isActive ? "green" : "red" }}>
          {NHX_CONFIG._app_info_.__SHORT_NAME} ●
        </span>{" "}
        <div className="time-range-selector">
          <select
            value={timeRange.type}
            onChange={handleTimeRangeChange}
            aria-label="Select the analysis period"
          >
            <option value="hour">Last hour</option>
            <option value="day">Last 24 hours</option>
            <option value="week">Last week</option>
          </select>
        </div>
        <div className="app_details">
          <p>
            <span
              style={{
                fontWeight: "bold",
                color: appStatus.isActive ? "green" : "red",
              }}
            >
              {appStatus.isActive ? "active" : "inactive"}
            </span>
          </p>
          <p>
            <span
              style={{
                fontWeight: "bold",
                color: isConnected ? "green" : "red",
              }}
            >
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </p>
          <p>
            <span
              style={{
                fontWeight: "bold",
                color: isAuthenticated ? "green" : "red",
              }}
            >
              {isAuthenticated ? "Authenticated" : "Unauthenticated"}
            </span>
          </p>
        </div>
      </div>

      <div className="analytics-content">
        <div className="analytics-details">
          {loading ? (
            <div className="loading">Fetching metrics data...</div>
          ) : (
            <>
              <div className="metrics-section">
                <h2>Performance metrics</h2>
                {metricsData.length > 0 ? (
                  <MetricsChart data={metricsData} timeRange={timeRange.type} />
                ) : (
                  <div className="no-data">No metrics data available</div>
                )}
              </div>
              <div className="log_analysis">
                <h2>Logs analysis</h2>
                <LogOverview logs={logs} timeRange={timeRange.type} />
              </div>
              <div className="logs-section">
                <h2>Performance overview</h2>
                <PerformanceOverview appId={appId} timeRange={timeRange.type} />
              </div>

              <div className="anomalies-section">
                <h2>Anomalies detection</h2>
                <AnomalyDetection logs={[]} metrics={null} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
