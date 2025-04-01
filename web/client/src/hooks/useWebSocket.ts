import { useEffect, useRef, useState } from "react";
import { LogEntry, PerformanceMetrics } from "../types/app";

interface WebSocketConfig {
  wsUrl: string;
  appId: string;
  userId: string;
  onLogs?: (logs: LogEntry[]) => void;
  onMetrics?: (metrics: PerformanceMetrics) => void;
  onAuthSuccess?: () => void;
  onAuthError?: (error: string) => void;
}

interface WebSocketState {
  isConnected: boolean;
  isAuthenticated: boolean;
  setFilters: (filters: { level?: string[]; appId?: string }) => void;
  clearLogs: () => void;
  requestHistory: () => void;
}

export const useWebSocket = (config: WebSocketConfig): WebSocketState => {
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  const connect = () => {
    try {
      wsRef.current = new WebSocket(config.wsUrl);
      setIsAuthenticated(false);

      wsRef.current.onopen = () => {
        console.log("WebSocket connecté");
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;

        // Authentification immédiate
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          console.log("Envoi des credentials pour authentification");
          wsRef.current.send(
            JSON.stringify({
              type: "auth",
              data: {
                userId: config.userId,
                appId: config.appId,
              },
            })
          );
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log("message", message);
          
          switch (message.type) {
            case "logs":
              config.onLogs?.(message.payload);
              break;
            case "metrics":
              config.onMetrics?.(message.payload);
              break;
            case "auth_success":
              console.log("Authentification réussie");
              setIsAuthenticated(true);
              config.onAuthSuccess?.();
              break;
            case "auth_error":
              console.error("Erreur d'authentification:", message.payload);
              setIsAuthenticated(false);
              config.onAuthError?.(message.payload);
              break;
            case "history":
              config.onLogs?.(message.payload);
              break;
          }
        } catch (error) {
          console.error("Erreur lors du traitement du message:", error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("Erreur WebSocket:", error);
        setIsConnected(false);
        setIsAuthenticated(false);
        handleReconnect();
      };

      wsRef.current.onclose = () => {
        console.log("WebSocket déconnecté");
        setIsConnected(false);
        setIsAuthenticated(false);
        handleReconnect();
      };
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      handleReconnect();
    }
  };

  const handleReconnect = () => {
    if (reconnectAttemptsRef.current < maxReconnectAttempts) {
      reconnectAttemptsRef.current++;
      console.log(
        `Tentative de reconnexion ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`
      );

      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, reconnectDelay);
    }
  };

  const setFilters = (filters: { level?: string[]; appId?: string }) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && isAuthenticated) {
      wsRef.current.send(
        JSON.stringify({
          type: "filter",
          filters,
        })
      );
    }
  };

  const clearLogs = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN && isAuthenticated) {
      wsRef.current.send(
        JSON.stringify({
          type: "clear",
        })
      );
    }
  };

  const requestHistory = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN && isAuthenticated) {
      wsRef.current.send(
        JSON.stringify({
          type: "history",
        })
      );
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [config.wsUrl, config.userId, config.appId]);

  return {
    isConnected,
    isAuthenticated,
    setFilters,
    clearLogs,
    requestHistory,
  };
};
