import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { useLogState } from "../../hooks/useLogState";
import { LogLevel } from "../../types/logs";
import { WebInterfaceConfig } from "../../config/config";
import "./Dashboard.scss";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const config: WebInterfaceConfig = {
  wsUrl: process.env.REACT_APP_WS_URL || "ws://localhost:3001",
  refreshInterval: 5000,
  maxLogEntries: 1000,
  theme: "light",
  dateFormat: "HH:mm:ss",
  autoReconnect: true,
  reconnectInterval: 3000,
  reconnectAttempts: 5,
};

export const Dashboard: React.FC = () => {
  const { logs, stats } = useLogState(config);

  const getChartData = () => {
    // Données pour le graphique d'activité horaire
    const hourlyData = {
      labels: Array.from({ length: 24 }, (_, i) => `${i}h`),
      datasets: [
        {
          label: "Activité horaire",
          data: Array.from({ length: 24 }, () =>
            Math.floor(Math.random() * 100)
          ),
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
      ],
    };

    // Données pour la distribution des niveaux de log
    const levelData = {
      labels: ["Error", "Warn", "Info", "Debug"],
      datasets: [
        {
          label: "Distribution par niveau",
          data: [
            stats?.byLevel[LogLevel.ERROR] || 0,
            stats?.byLevel[LogLevel.WARN] || 0,
            stats?.byLevel[LogLevel.INFO] || 0,
            stats?.byLevel[LogLevel.DEBUG] || 0,
          ],
          backgroundColor: [
            "rgba(255, 99, 132, 0.5)",
            "rgba(255, 206, 86, 0.5)",
            "rgba(75, 192, 192, 0.5)",
            "rgba(153, 102, 255, 0.5)",
          ],
        },
      ],
    };

    return { hourlyData, levelData };
  };

  const { hourlyData, levelData } = getChartData();

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div className="stat-card">
          <h3>Total des logs</h3>
          <p className="value">{stats?.total || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Taux d'erreur</h3>
          <p className="value error">{(stats?.errorRate || 0).toFixed(1)}%</p>
        </div>
      </header>

      <div className="dashboard__charts">
        <div className="chart-container">
          <h2>Activité horaire</h2>
          <Line
            data={hourlyData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        </div>
        <div className="chart-container">
          <h2>Distribution des logs</h2>
          <Bar
            data={levelData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        </div>
      </div>
    </div>
  );
};
