import React, { useState } from "react";
import { LogEntry } from "../../../types/app";
import "./LogAnalysis.scss";

interface LogAnalysisProps {
  logs: LogEntry[];
}

export const LogAnalysis: React.FC<LogAnalysisProps> = ({ logs }) => {
  const [filter, setFilter] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState<LogEntry["level"] | "all">(
    "all"
  );
  const [sortBy, setSortBy] = useState<"timestamp" | "level">("timestamp");

  const filteredLogs = logs
    .filter((log) => {
      const matchesSearch = log.message
        .toLowerCase()
        .includes(filter.toLowerCase());
      const matchesLevel = levelFilter === "all" || log.level === levelFilter;
      return matchesSearch && matchesLevel;
    })
    .sort((a, b) => {
      if (sortBy === "timestamp") {
        return (
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      }
      return a.level.localeCompare(b.level);
    });

  const getLevelColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "error":
      case "fatal":
        return "#dc3545";
      case "warn":
        return "#ffc107";
      case "info":
        return "#17a2b8";
      default:
        return "#6c757d";
    }
  };

  return (
    <div className="log-analysis">
      <div className="log-filters">
        <input
          type="text"
          placeholder="Rechercher dans les logs..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="search-input"
        />
        <select
          title="Filtrer par niveau"
          value={levelFilter}
          onChange={(e) =>
            setLevelFilter(e.target.value as LogEntry["level"] | "all")
          }
          className="level-filter"
        >
          <option value="all">Tous les niveaux</option>
          <option value="debug">Debug</option>
          <option value="info">Info</option>
          <option value="warn">Warning</option>
          <option value="error">Error</option>
          <option value="fatal">Fatal</option>
        </select>
        <select
          title="Trier par"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "timestamp" | "level")}
          className="sort-select"
        >
          <option value="timestamp">Trier par date</option>
          <option value="level">Trier par niveau</option>
        </select>
      </div>

      <div className="log-stats">
        <div className="stat-card">
          <h4>Total des logs</h4>
          <p>{logs.length}</p>
        </div>
        <div className="stat-card">
          <h4>Erreurs</h4>
          <p>
            {
              logs.filter(
                (log) => log.level === "error" || log.level === "fatal"
              ).length
            }
          </p>
        </div>
        <div className="stat-card">
          <h4>Warnings</h4>
          <p>{logs.filter((log) => log.level === "warn").length}</p>
        </div>
      </div>

      <div className="log-list">
        {filteredLogs.map((log) => (
          <div key={log.id} className="log-entry">
            <div className="log-header">
              <span className="log-timestamp">
                {new Date(log.timestamp).toLocaleString()}
              </span>
              <span
                className="log-level"
                style={{ backgroundColor: getLevelColor(log.level) }}
              >
                {log.level.toUpperCase()}
              </span>
            </div>
            <div className="log-message">{log.message}</div>
            {log.context && (
              <div className="log-context">
                <pre>{JSON.stringify(log.context, null, 2)}</pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
