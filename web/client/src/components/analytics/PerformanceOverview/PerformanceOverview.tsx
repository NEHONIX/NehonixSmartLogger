import React, { useEffect, useState } from "react";
import MetricsChart from "../MetricsChart/MetricsChart";
import "./PerformanceOverview.scss";

interface PerformanceData {
  timestamp: string;
  cpu: number;
  memory: number;
  requests: number;
}

interface PerformanceOverviewProps {
  appId: string;
  timeRange: string;
}

const PerformanceOverview: React.FC<PerformanceOverviewProps> = ({
  appId,
  timeRange,
}) => {
  const [data, setData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simuler un appel API pour le moment
        const mockData = generateMockData(timeRange);
        setData(mockData);
        setError(null);
      } catch (err) {
        setError("Erreur lors du chargement des données");
        console.error("Erreur:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Mettre à jour toutes les 30 secondes
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [appId, timeRange]);

  const generateMockData = (range: string): PerformanceData[] => {
    const now = new Date();
    const data: PerformanceData[] = [];
    let points: number;
    let interval: number;

    switch (range) {
      case "1h":
        points = 60;
        interval = 60 * 1000; // 1 minute
        break;
      case "24h":
        points = 144;
        interval = 10 * 60 * 1000; // 10 minutes
        break;
      case "7d":
        points = 168;
        interval = 60 * 60 * 1000; // 1 hour
        break;
      default:
        points = 60;
        interval = 60 * 1000;
    }

    for (let i = points - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - i * interval);
      data.push({
        timestamp: time.toISOString(),
        cpu: Math.random() * 100,
        memory: 40 + Math.random() * 30,
        requests: Math.floor(Math.random() * 200),
      });
    }

    return data;
  };

  if (loading) {
    return (
      <div className="performance-overview">
        <div className="loading">Chargement des métriques...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="performance-overview">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="performance-overview">
      <div className="overview-header">
        <h2>Vue d'ensemble des performances</h2>
        <div className="performance-score">
          <div
            className="score-circle"
            style={{
              background: `${getScoreColor(getAverageScore(data))}`,
            }}
          >
            <span className="score-value">{getAverageScore(data)}</span>
            <span className="score-label">Score</span>
          </div>
          <span className="score-status">
            {getScoreStatus(getAverageScore(data))}
          </span>
        </div>
      </div>

      <MetricsChart data={data} timeRange={timeRange} />

      <div className="overview-grid">
        <div className="overview-card">
          <h3>Statistiques actuelles</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">CPU</span>
              <span
                className="stat-value"
                style={{ color: getMetricColor(data[data.length - 1].cpu) }}
              >
                {data[data.length - 1].cpu.toFixed(1)}%
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Mémoire</span>
              <span
                className="stat-value"
                style={{ color: getMetricColor(data[data.length - 1].memory) }}
              >
                {data[data.length - 1].memory.toFixed(1)}%
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Requêtes/s</span>
              <span className="stat-value">
                {data[data.length - 1].requests}
              </span>
            </div>
          </div>
        </div>

        <div className="overview-card">
          <h3>Recommandations</h3>
          <ul className="recommendations-list">
            {getRecommendations(data).map((rec, index) => (
              <li key={index} className={`recommendation-item ${rec.type}`}>
                {rec.message}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const getAverageScore = (data: PerformanceData[]): number => {
  if (data.length === 0) return 0;
  const lastMetrics = data[data.length - 1];
  const cpuScore = 100 - lastMetrics.cpu;
  const memoryScore = 100 - lastMetrics.memory;
  return Math.round((cpuScore + memoryScore) / 2);
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return "#28a745";
  if (score >= 60) return "#ffc107";
  return "#dc3545";
};

const getScoreStatus = (score: number): string => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Attention requise";
  return "Critique";
};

const getMetricColor = (value: number): string => {
  if (value <= 60) return "#28a745";
  if (value <= 80) return "#ffc107";
  return "#dc3545";
};

const getRecommendations = (
  data: PerformanceData[]
): Array<{ type: string; message: string }> => {
  const recommendations: Array<{ type: string; message: string }> = [];
  const lastMetrics = data[data.length - 1];

  if (lastMetrics.cpu > 80) {
    recommendations.push({
      type: "error",
      message:
        "Utilisation CPU critique. Considérez l'augmentation des ressources.",
    });
  } else if (lastMetrics.cpu > 60) {
    recommendations.push({
      type: "warning",
      message: "Utilisation CPU élevée. Surveillez la tendance.",
    });
  }

  if (lastMetrics.memory > 80) {
    recommendations.push({
      type: "error",
      message:
        "Utilisation mémoire critique. Vérifiez les fuites de mémoire potentielles.",
    });
  } else if (lastMetrics.memory > 60) {
    recommendations.push({
      type: "warning",
      message: "Utilisation mémoire élevée. Optimisation recommandée.",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: "success",
      message: "Toutes les métriques sont dans les limites normales.",
    });
  }

  return recommendations;
};

export default PerformanceOverview;
