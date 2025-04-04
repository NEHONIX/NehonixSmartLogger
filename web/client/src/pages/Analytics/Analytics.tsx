import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  PerformanceMetrics,
  LogEntry,
  Anomaly,
  TimeRange,
} from "../../types/app";
import { appApi } from "../../services/appApi";
import { MetricsChart } from "../../components/analytics/MetricsChart/MetricsChart";
import { PerformanceOverview } from "../../components/analytics/PerformanceOverview/PerformanceOverview";
import { AnomalyDetection } from "../../components/analytics/AnomalyDetection/AnomalyDetection";
import "./Analytics.scss";
import { useFecthApps } from "../../hooks/useFetchApps";
import { useWebSocket } from "../../hooks/useWebSocket";
import { NHX_CONFIG } from "../../config/app.conf";
import { useAuth } from "../../contexts/AuthContext";
import { useSetPageTitle } from "../../utils/setPageTitle";

const Analytics: React.FC = () => {
  const { appId } = useParams<{ appId: string }>();
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>({
    start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString(),
    type: "day",
  });
  const [loading, setLoading] = useState(true);
  const { apps, fetchApps, isLoading: isLoadingApps } = useFecthApps();
  const { user } = useAuth();

  useEffect(() => {
    console.log("metrics", metrics);
  }, [metrics]);

  // Connexion WebSocket avec gestion des métriques
  const { isConnected, setFilters, sendCommand, isAuthenticated } =
    useWebSocket({
      wsUrl: NHX_CONFIG._global_.__WEBSOCKET_URL__,
      appId: appId || "",
      userId: user?.uid || "",
      onLogs: (newLogs) => setLogs((prev) => [...prev, ...newLogs]),
      onMetrics: (newMetrics) => {
        const adaptedMetrics: PerformanceMetrics = {
          ...newMetrics,
          disk: {
            // On multi les valeurs de mémoire comme approximation pour le disque
            // Multiplier par 10 pour simuler un disque plus grand que la RAM
            total: newMetrics.memory.total * 10,
            used: newMetrics.memory.used * 10,
            free: newMetrics.memory.free * 10,
          },
        };

        setMetrics(adaptedMetrics);
        setLoading(false);
      },
    });

  useEffect(() => {
    if (!appId) return;
    fetchApps({ opt: { useCache: true } });
  }, [appId]);

  const app = apps.find((app) => app.id === appId);

  useSetPageTitle({
    title: `  ${NHX_CONFIG._app_info_.__SHORT_NAME}  ●  ${app?.name} `,
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

  const handleTimeRangeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
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

  return (
    <div className="analytics">
      <div className="analytics-header">
        <h1>
          {app?.name}{" "}
          <span style={{ color: isConnected ? "green" : "red" }}>●</span>{" "}
          Real-time analytics
        </h1>
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
            App status:{" "}
            <span
              style={{
                fontWeight: "bold",
                color: app?.status === "active" ? "green" : "red",
              }}
            >
              {app?.status}
            </span>
          </p>
          <p>
            Server status:{" "}
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
            Auth status:{" "}
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
                {metrics ? (
                  <MetricsChart metrics={metrics} timeRange={timeRange.type} />
                ) : (
                  <div className="no-data">No metrics data available</div>
                )}
              </div>

              <div className="logs-section">
                <h2>Logs analysis</h2>
                <PerformanceOverview metrics={metrics} logs={logs} />
              </div>

              <div className="anomalies-section">
                <h2>Anomalies detection</h2>
                <AnomalyDetection logs={logs} metrics={metrics} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
