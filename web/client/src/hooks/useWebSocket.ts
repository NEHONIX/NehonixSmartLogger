import { useEffect, useRef, useState } from "react";
import { LogEntry, PerformanceMetrics } from "../types/app";

export interface WebSocketHookProps {
  wsUrl: string;
  appId: string;
  userId: string;
  onLogs?: (logs: LogEntry[]) => void;
  onMetrics?: (metrics: PerformanceMetrics) => void;
}

export const useWebSocket = ({
  wsUrl,
  appId,
  userId,
  onLogs,
  onMetrics,
}: WebSocketHookProps) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  useEffect(() => {
    const connect = () => {
      if (!wsUrl || !appId || !userId) {
        console.error("Not allowed to connect to the WebSocket");
        return;
      }

      try {
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log("Connecté au serveur de logs");
          setIsConnected(true);
          reconnectAttemptsRef.current = 0;
          // Authentification
          ws.send(
            JSON.stringify({
              type: "auth",
              data: {
                userId,
                appId,
              },
            })
          );
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log("data", data);
          switch (data.type) {
            case "logs":
              onLogs?.(data.data);
              break;
            case "metrics":
              onMetrics?.(data.payload);
              break;
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          handleReconnect();
        };

        ws.onerror = (error) => {
          console.error("Erreur WebSocket:", error);
          setIsConnected(false);
        };

        wsRef.current = ws;
      } catch (error) {
        console.error("Erreur lors de la connexion au WebSocket:", error);
        handleReconnect();
      }
    };

    const handleReconnect = () => {
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++;
        setTimeout(connect, reconnectDelay);
      }
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [wsUrl, appId, userId, onLogs, onMetrics]);

  const setFilters = (filters: { level?: string[]; appId?: string }) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "filter",
          filters,
        })
      );
    }
  };

  return {
    isConnected,
    setFilters,
  };
};
