import React, { useEffect, useState } from "react";
import { LogEntry, PerformanceMetrics, Anomaly } from "../../../types/app";
import "./AnomalyDetection.scss";

interface AnomalyDetectionProps {
  logs: LogEntry[];
  metrics: PerformanceMetrics | null;
}

export const AnomalyDetection: React.FC<AnomalyDetectionProps> = ({
  logs,
  metrics,
}) => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const detectAnomalies = async () => {
      setIsAnalyzing(true);
      const detectedAnomalies: Anomaly[] = [];

      // Détection des erreurs critiques
      const criticalErrors = logs.filter(
        (log) =>
          log.level === "fatal" ||
          (log.level === "error" &&
            log.message.toLowerCase().includes("critical"))
      );

      if (criticalErrors.length > 0) {
        detectedAnomalies.push({
          id: `error-${Date.now()}`,
          type: "error",
          severity: "critical",
          description: `${criticalErrors.length} erreur(s) critique(s) détectée(s)`,
          timestamp: new Date().toISOString(),
          logs: criticalErrors,
          status: "active",
        });
      }

      // Détection des problèmes de performance
      if (metrics) {
        if (metrics.cpu.usage > 90) {
          detectedAnomalies.push({
            id: `cpu-${Date.now()}`,
            type: "performance",
            severity: "high",
            description: "Utilisation CPU élevée",
            timestamp: new Date().toISOString(),
            metrics,
            status: "active",
          });
        }

        if (metrics.memory.used / metrics.memory.total > 0.9) {
          detectedAnomalies.push({
            id: `memory-${Date.now()}`,
            type: "performance",
            severity: "high",
            description: "Utilisation mémoire élevée",
            timestamp: new Date().toISOString(),
            metrics,
            status: "active",
          });
        }
      }

      // Détection des patterns suspects dans les logs
      const suspiciousPatterns = logs.filter(
        (log) =>
          log.message.toLowerCase().includes("security") ||
          log.message.toLowerCase().includes("unauthorized") ||
          log.message.toLowerCase().includes("failed login")
      );

      if (suspiciousPatterns.length > 0) {
        detectedAnomalies.push({
          id: `security-${Date.now()}`,
          type: "security",
          severity: "medium",
          description: "Activité suspecte détectée",
          timestamp: new Date().toISOString(),
          logs: suspiciousPatterns,
          status: "active",
        });
      }

      setAnomalies(detectedAnomalies);
      setIsAnalyzing(false);
    };

    detectAnomalies();
  }, [logs, metrics]);

  const getSeverityColor = (severity: Anomaly["severity"]) => {
    switch (severity) {
      case "critical":
        return "#dc3545";
      case "high":
        return "#fd7e14";
      case "medium":
        return "#ffc107";
      default:
        return "#6c757d";
    }
  };

  return (
    <div className="anomaly-detection">
      <div className="anomaly-header">
        <h2>Détection d'Anomalies</h2>
        {isAnalyzing && <span className="analyzing">Analyse en cours...</span>}
      </div>

      {anomalies.length === 0 ? (
        <div className="no-anomalies">
          <p>Aucune anomalie détectée</p>
        </div>
      ) : (
        <div className="anomaly-list">
          {anomalies.map((anomaly) => (
            <div key={anomaly.id} className="anomaly-card">
              <div className="anomaly-header">
                <span
                  className="anomaly-severity"
                  style={{
                    backgroundColor: getSeverityColor(anomaly.severity),
                  }}
                >
                  {anomaly.severity.toUpperCase()}
                </span>
                <span className="anomaly-type">{anomaly.type}</span>
                <span className="anomaly-timestamp">
                  {new Date(anomaly.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="anomaly-description">{anomaly.description}</p>

              {anomaly.logs && anomaly.logs.length > 0 && (
                <div className="anomaly-logs">
                  <h4>Logs associés</h4>
                  <div className="log-preview">
                    {anomaly.logs.slice(0, 3).map((log) => (
                      <div key={log.id} className="log-item">
                        <span className="log-level">{log.level}</span>
                        <span className="log-message">{log.message}</span>
                      </div>
                    ))}
                    {anomaly.logs.length > 3 && (
                      <p className="more-logs">
                        +{anomaly.logs.length - 3} autres logs...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {anomaly.metrics && (
                <div className="anomaly-metrics">
                  <h4>Métriques au moment de l'anomalie</h4>
                  <div className="metrics-grid">
                    <div className="metric-item">
                      <span>CPU:</span>
                      <span>{anomaly.metrics.cpu.usage}%</span>
                    </div>
                    <div className="metric-item">
                      <span>Mémoire:</span>
                      <span>
                        {(
                          (anomaly.metrics.memory.used /
                            anomaly.metrics.memory.total) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="anomaly-actions">
                <button
                  className={`status-button ${anomaly.status}`}
                  onClick={() => {
                    setAnomalies((prev) =>
                      prev.map((a) =>
                        a.id === anomaly.id
                          ? {
                              ...a,
                              status:
                                a.status === "active"
                                  ? "investigating"
                                  : "active",
                            }
                          : a
                      )
                    );
                  }}
                >
                  {anomaly.status === "active" ? "Enquêter" : "Réactiver"}
                </button>
                <button
                  className="resolve-button"
                  onClick={() => {
                    setAnomalies((prev) =>
                      prev.map((a) =>
                        a.id === anomaly.id ? { ...a, status: "resolved" } : a
                      )
                    );
                  }}
                >
                  Résoudre
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
