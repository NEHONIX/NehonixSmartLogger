import { useEffect, useRef, useState, useCallback } from "react";
import { commandType, LogEntry, UserAction } from "../types/app";

interface WebSocketConfig {
  wsUrl: string;
  appId: string;
  userId: string;
  onLogs?: (logs: LogEntry[]) => void;
  onAuthSuccess?: () => void;
  onAuthError?: (error: string) => void;
  onCommandResponse?: (response: any) => void;
  onActionsUpdate?: (actions: UserAction[]) => void;
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
}

export const useWebSocket = (config: WebSocketConfig): WebSocketState => {
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(config.wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
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
        case "history":
          if (message.payload) {
            config.onLogs?.(message.payload);
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

    return () => {
      ws.close();
    };
  }, [config.wsUrl, config.userId, config.appId]);

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
  };
};
