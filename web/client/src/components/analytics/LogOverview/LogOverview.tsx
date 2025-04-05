import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { LogEntry } from "../../../types/app";
import "./LogOverview.scss";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

interface Props {
  logs: LogEntry[];
  timeRange: string;
}

const LogOverview: React.FC<Props> = ({ logs, timeRange }) => {
  const analytics = useMemo(() => {
    const levelCounts = {
      ERROR: 0,
      WARN: 0,
      INFO: 0,
      DEBUG: 0,
    };

    const hourlyDistribution: { [hour: string]: number } = {};
    const errorPatterns: { [message: string]: number } = {};
    let totalResponseTime = 0;
    let responseTimeCount = 0;
    console.log("logs: ", logs);
    logs.forEach((log) => {
      // Comptage des niveaux
      if (log.level) {
        levelCounts[log.level as keyof typeof levelCounts]++;
      }

      // Distribution horaire
      const hour = new Date(log.timestamp).getHours();
      hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;

      // Patterns d'erreurs
      if (log.level === "error") {
        errorPatterns[log.message] = (errorPatterns[log.message] || 0) + 1;
      }

      // Temps de réponse moyen (si disponible dans les logs)
      if (log.metadata?.responseTime) {
        totalResponseTime += log.metadata.responseTime;
        responseTimeCount++;
      }
    });

    // Top 5 des erreurs
    const topErrors = Object.entries(errorPatterns)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      levelCounts,
      hourlyDistribution,
      topErrors,
      avgResponseTime: responseTimeCount
        ? totalResponseTime / responseTimeCount
        : 0,
    };
  }, [logs]);

  const levelChartData = {
    labels: ["ERROR", "WARN", "INFO", "DEBUG"],
    datasets: [
      {
        data: [
          analytics.levelCounts.ERROR,
          analytics.levelCounts.WARN,
          analytics.levelCounts.INFO,
          analytics.levelCounts.DEBUG,
        ],
        backgroundColor: [
          "rgba(255, 99, 132, 0.8)",
          "rgba(255, 206, 86, 0.8)",
          "rgba(54, 162, 235, 0.8)",
          "rgba(75, 192, 192, 0.8)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const hourlyChartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}h`),
    datasets: [
      {
        label: "Nombre de logs",
        data: Array.from(
          { length: 24 },
          (_, i) => analytics.hourlyDistribution[i] || 0
        ),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="log-overview">
      <div className="overview-grid">
        <div className="chart-card level-distribution">
          <h3>Distribution des niveaux de logs</h3>
          <div className="chart-container">
            <Doughnut
              data={levelChartData}
              options={{
                plugins: {
                  legend: {
                    position: "right",
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="chart-card hourly-distribution">
          <h3>Distribution horaire</h3>
          <div className="chart-container">
            <Bar
              data={hourlyChartData}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="metrics-card error-patterns">
          <h3>Top 5 des erreurs</h3>
          <div className="error-list">
            {analytics.topErrors.map(([message, count], index) => (
              <div key={index} className="error-item">
                <div className="error-bar">
                  <div
                    className="error-bar-fill"
                    style={{
                      width: `${(count / analytics.topErrors[0][1]) * 100}%`,
                    }}
                  />
                </div>
                <div className="error-details">
                  <span className="error-count">{count}</span>
                  <span className="error-message">{message}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="metrics-card performance">
          <h3>Performance</h3>
          <div className="performance-metrics">
            <div className="metric">
              <span className="label">Temps de réponse moyen</span>
              <span className="value">
                {analytics.avgResponseTime.toFixed(2)}ms
              </span>
            </div>
            <div className="metric">
              <span className="label">Total des logs</span>
              <span className="value">{logs.length}</span>
            </div>
            <div className="metric">
              <span className="label">Taux d'erreur</span>
              <span className="value">
                {((analytics.levelCounts.ERROR / logs.length) * 100).toFixed(2)}
                %
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogOverview;
