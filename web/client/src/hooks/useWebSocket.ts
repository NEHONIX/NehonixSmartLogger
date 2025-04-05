import { useEffect, useRef, useState, useCallback } from "react";
import {
  commandType,
  LogEntry,
  UserAction,
  PerformanceMetrics,
} from "../types/app";

interface WebSocketConfig {
  wsUrl: string;
  appId: string;
  userId: string;
  onLogs?: (logs: LogEntry[]) => void;
  onAuthSuccess?: () => void;
  onAuthError?: (error: string) => void;
  onCommandResponse?: (response: any) => void;
  onActionsUpdate?: (actions: UserAction[]) => void;
  onMetrics?: (metrics: PerformanceMetrics) => void;
}

export interface Command {
  type: commandType;
  data: any;
}

export interface WebSocketState {
  isConnected: boolean;
  isAuthenticated: boolean;
  setFilters: (filters: { appId: string; level?: string[] }) => void;
  clearLogs: () => void;
  requestHistory: () => void;
  connectionError?: string;
  sendCommand: (command: Command) => void;
  reconnectAttempts: number;
  reconnect: () => void;
}

export const useWebSocket = (config: WebSocketConfig): WebSocketState => {
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [connectionError, setConnectionError] = useState<string>();
  const wsRef = useRef<WebSocket | null>(null);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const ws = new WebSocket(config.wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      setConnectionError(undefined);
      setReconnectAttempts(0);
      ws.send(
        JSON.stringify({
          type: "auth",
          data: {
            userId: config.userId,
            appId: config.appId,
          },
        })
      );
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
      setIsAuthenticated(false);

      if (reconnectAttempts < maxReconnectAttempts) {
        setReconnectAttempts((prev) => prev + 1);
        setConnectionError(
          `Tentative de reconnexion ${
            reconnectAttempts + 1
          }/${maxReconnectAttempts}...`
        );
        reconnectTimeoutRef.current = setTimeout(connect, reconnectDelay);
      } else {
        setConnectionError(
          "Nombre maximum de tentatives de reconnexion atteint. Veuillez réessayer manuellement."
        );
      }
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case "auth_success":
          setIsAuthenticated(true);
          config.onAuthSuccess?.();
          // Demander les actions après l'authentification
          ws.send(JSON.stringify({ type: "get_last_actions" }));
          break;
        case "auth_error":
          setIsAuthenticated(false);
          config.onAuthError?.(message.payload.message);
          break;
        case "logs":
          console.log("logs in useWebSocket: ", message.payload);
          if (message.payload) {
            config.onLogs?.(message.payload);
          }
          break;
        case "history":
          if (message.payload) {
            config.onLogs?.(message.payload);
          }
          break;
        case "metrics":
          if (message.payload) {
            config.onMetrics?.(message.payload);
          }
          break;
        case "command_response":
          config.onCommandResponse?.(message.payload);
          break;
        case "get_last_actions":
          config.onActionsUpdate?.(message.payload);
          break;
      }
    };

    wsRef.current = ws;
  }, [config.wsUrl, config.userId, config.appId, reconnectAttempts]);

  const reconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    setReconnectAttempts(0);
    setConnectionError(undefined);
    connect();
  }, [connect]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, [connect]);

  const setFilters = useCallback(
    (filters: { appId: string; level?: string[] }) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "filter",
            data: {
              userId: config.userId,
              appId: filters.appId,
              level: filters.level,
            },
          })
        );
      }
    },
    [config.userId]
  );

  const clearLogs = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "clear",
        })
      );
    }
  }, []);

  const requestHistory = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "history",
          data: {
            userId: config.userId,
            appId: config.appId,
          },
        })
      );
    }
  }, [config.userId, config.appId]);

  const sendCommand = useCallback(
    (command: Command) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "command",
            data: {
              userId: config.userId,
              appId: config.appId,
              ...command,
            },
          })
        );
      }
    },
    [config.userId, config.appId]
  );

  return {
    isConnected,
    isAuthenticated,
    setFilters,
    clearLogs,
    requestHistory,
    sendCommand,
    reconnectAttempts,
    reconnect,
    connectionError,
  };
};
