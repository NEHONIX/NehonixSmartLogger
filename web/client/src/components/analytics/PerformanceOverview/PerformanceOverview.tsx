import React from "react";
import { PerformanceMetrics, LogEntry } from "../../../types/app";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./PerformanceOverview.scss";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PerformanceOverviewProps {
  metrics: PerformanceMetrics | null;
  logs: LogEntry[];
}

export const PerformanceOverview: React.FC<PerformanceOverviewProps> = ({
  metrics,
  logs,
}) => {
  const getPerformanceScore = () => {
    if (!metrics) return 0;

    const cpuScore = 100 - (metrics.cpu?.usage ?? 0);
    const memoryScore = metrics.memory?.total
      ? 100 - ((metrics.memory.used ?? 0) / metrics.memory.total) * 100
      : 0;
    const diskScore = metrics.disk?.total
      ? 100 - ((metrics.disk.used ?? 0) / metrics.disk.total) * 100
      : 0;

    return Math.round((cpuScore + memoryScore + diskScore) / 3);
  };

  const getErrorRate = () => {
    if (!logs.length) return 0;
    const errorLogs = logs.filter(
      (log) => log.level === "error" || log.level === "fatal"
    );
    return (errorLogs.length / logs.length) * 100;
  };

  const getPerformanceStatus = (score: number) => {
    if (score >= 90) return { text: "Excellent", color: "#28a745" };
    if (score >= 70) return { text: "Bon", color: "#17a2b8" };
    if (score >= 50) return { text: "Moyen", color: "#ffc107" };
    return { text: "Critique", color: "#dc3545" };
  };

  const performanceData = {
    labels: ["CPU", "Mémoire", "Disque"],
    datasets: [
      {
        label: "Utilisation (%)",
        data: metrics
          ? [
              metrics.cpu?.usage ?? 0,
              metrics.memory?.total
                ? ((metrics.memory.used ?? 0) / metrics.memory.total) * 100
                : 0,
              metrics.disk?.total
                ? ((metrics.disk.used ?? 0) / metrics.disk.total) * 100
                : 0,
            ]
          : [0, 0, 0],
        backgroundColor: [
          "rgba(75, 192, 192, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Utilisation des Ressources",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const performanceScore = getPerformanceScore();
  const errorRate = getErrorRate();
  const status = getPerformanceStatus(performanceScore);

  return (
    <div className="performance-overview">
      <div className="overview-header">
        <h2>Vue d'Ensemble des Performances</h2>
        <div className="performance-score">
          <div
            className="score-circle"
            style={{ backgroundColor: status.color }}
          >
            <span className="score-value">{performanceScore}</span>
            <span className="score-label">Score</span>
          </div>
          <div className="score-status" style={{ color: status.color }}>
            {status.text}
          </div>
        </div>
      </div>

      <div className="overview-grid">
        <div className="overview-card">
          <h3>Utilisation des Ressources</h3>
          <Bar options={chartOptions} data={performanceData} />
        </div>

        <div className="overview-card">
          <h3>Statistiques</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Taux d'Erreurs</span>
              <span
                className="stat-value"
                style={{ color: errorRate > 5 ? "#dc3545" : "#28a745" }}
              >
                {errorRate.toFixed(1)}%
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total des Logs</span>
              <span className="stat-value">{logs.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Processus</span>
              <span className="stat-value">
                {metrics?.processes?.running !== undefined &&
                metrics?.processes?.total !== undefined
                  ? `${metrics.processes.running}/${metrics.processes.total}`
                  : "N/A"}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Connexions Réseau</span>
              <span className="stat-value">
                {metrics?.network?.connections !== undefined
                  ? metrics.network.connections
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="overview-card">
          <h3>Recommandations</h3>
          <ul className="recommendations-list">
            {performanceScore < 70 && (
              <li className="recommendation-item warning">
                Optimisation des ressources recommandée
              </li>
            )}
            {errorRate > 5 && (
              <li className="recommendation-item error">
                Taux d'erreurs élevé - Investigation nécessaire
              </li>
            )}
            {metrics?.processes?.running !== undefined &&
              metrics?.processes?.total !== undefined &&
              metrics.processes.running > metrics.processes.total * 0.8 && (
                <li className="recommendation-item warning">
                  Nombre élevé de processus en cours d'exécution
                </li>
              )}
            {metrics?.network?.connections !== undefined &&
              metrics.network.connections > 1000 && (
                <li className="recommendation-item warning">
                  Nombre élevé de connexions réseau
                </li>
              )}
          </ul>
        </div>
      </div>
    </div>
  );
};
