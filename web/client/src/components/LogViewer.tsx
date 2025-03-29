import React, { useEffect, useState, useCallback, useRef } from "react";
import { LogEntry, LogLevel } from "../types/log";
import { formatTimestamp } from "../utils/dateUtils";
import "./LogViewer.css";

interface LogViewerProps {
  wsUrl: string;
}

export const LogViewer: React.FC<LogViewerProps> = ({ wsUrl }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [filter, setFilter] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | "all">("all");
  const wsRef = useRef<WebSocket | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const connectWebSocket = useCallback(() => {
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("🌐 Connecté au serveur WebSocket");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case "logs":
        case "history":
          setLogs((prevLogs) => [...prevLogs, ...data.data]);
          break;
        case "clear":
          setLogs([]);
          break;
        default:
          console.warn("⚠️ Type de message non reconnu:", data.type);
      }
    };

    ws.onclose = () => {
      console.log("🔌 Déconnecté du serveur WebSocket");
      setIsConnected(false);
      // Tentative de reconnexion après 5 secondes
      setTimeout(connectWebSocket, 5000);
    };

    ws.onerror = (error) => {
      console.error("❌ Erreur WebSocket:", error);
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [wsUrl]);

  useEffect(() => {
    const cleanup = connectWebSocket();
    return cleanup;
  }, [connectWebSocket]);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = log.message
      .toLowerCase()
      .includes(filter.toLowerCase());
    const matchesLevel = selectedLevel === "all" || log.level === selectedLevel;
    return matchesFilter && matchesLevel;
  });

  const clearLogs = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "clear" }));
    }
  };

  const getLevelColor = (level: LogLevel): string => {
    switch (level) {
      case "error":
        return "#ff4444";
      case "warn":
        return "#ffbb33";
      case "info":
        return "#33b5e5";
      case "debug":
        return "#00C851";
      default:
        return "#ffffff";
    }
  };

  return (
    <div className="log-viewer">
      <div className="log-header">
        <div className="connection-status">
          <span
            className={`status-dot ${
              isConnected ? "connected" : "disconnected"
            }`}
          />
          {isConnected ? "Connecté" : "Déconnecté"}
        </div>
        <div className="controls">
          <input
            type="text"
            placeholder="Filtrer les logs..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-input"
          />
          <select
            value={selectedLevel}
            onChange={(e) =>
              setSelectedLevel(e.target.value as LogLevel | "all")
            }
            className="level-select"
            aria-label="Sélectionner le niveau de log"
          >
            <option value="all">Tous les niveaux</option>
            <option value="error">Error</option>
            <option value="warn">Warn</option>
            <option value="info">Info</option>
            <option value="debug">Debug</option>
          </select>
          <button onClick={clearLogs} className="clear-button">
            Effacer
          </button>
        </div>
      </div>
      <div className="log-container">
        {filteredLogs.map((log, index) => (
          <div
            key={index}
            className="log-entry"
            style={{ borderLeftColor: getLevelColor(log.level) }}
          >
            <span className="log-timestamp">
              {formatTimestamp(log.timestamp)}
            </span>
            <span className={`log-level ${log.level}`}>{log.level}</span>
            <span className="log-message">{log.message}</span>
            {log.data && (
              <pre className="log-data">
                {JSON.stringify(log.data, null, 2)}
              </pre>
            )}
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};
