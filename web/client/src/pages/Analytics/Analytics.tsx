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

  // Connexion WebSocket
  const { isConnected, setFilters } = useWebSocket({
    wsUrl: NHX_CONFIG._global_.__WEBSOCKET_URL__,
    appId: appId || "",
    userId: user?.uid || "",
    onLogs: (newLogs) => setLogs((prev) => [...prev, ...newLogs]),
  });

  useEffect(() => {
    console.log("metrics", metrics);
  }, [metrics]);

  useEffect(() => {
    if (!appId) return;
    fetchApps({ opt: { useCache: true } });
  }, [appId]);

  const app = apps.find((app) => app.id === appId);

  useSetPageTitle({
    title: `  ${NHX_CONFIG._app_info_.__SHORT_NAME}  ●  ${app?.name} `,
    description: "Analyse des performances de l'application",
  });

  // Chargement initial des données historiques
  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (!appId) return;

      try {
        setLoading(true);
        const [metricsData, logsData] = await Promise.all([
          appApi.getMetrics(appId, timeRange.type),
          appApi.getLogs(appId, timeRange.type),
        ]);

        setMetrics(metricsData);
        setLogs(logsData);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [appId, timeRange]);

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
      </div>

      <div className="analytics-content">
        <div className="analytics-details">
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
              WebSocket status:{" "}
              <span
                style={{
                  fontWeight: "bold",
                  color: isConnected ? "green" : "red",
                }}
              >
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </p>
          </div>
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
