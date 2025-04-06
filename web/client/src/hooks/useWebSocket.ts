import { useEffect, useRef, useState, useCallback } from "react";
import {
  commandType,
  LogEntry,
  UserAction,
  PerformanceMetrics,
} from "../types/app";
import { NHX_CONFIG } from "../config/app.conf";
import { useNavigate } from "react-router-dom";

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
  onStatusResponse?: (status: StatusResponse) => void;
  onConnectionError?: (error: string) => void;
}

export interface Command {
  type: commandType;
  data: any;
}

export interface StatusResponse {
  type: "status_response";
  payload: {
    success: boolean; // true si tout est OK
    message: string; // message explicatif
    status: {
      userExists: boolean; // l'utilisateur existe
      appExists: boolean; // l'application existe
      userHasAccess: boolean; // l'utilisateur a accès à l'application
      appIsActive: boolean; // l'application est active
    };
  };
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
  checkStatus: () => void;
  status: StatusResponse | null;
}

export const useWebSocket = (config: WebSocketConfig): WebSocketState => {
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [connectionError, setConnectionError] = useState<string>();
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const navigate = useNavigate();
  const wsRef = useRef<WebSocket | null>(null);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const statusCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  const checkStatus = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const checkStatusMessage = {
        type: "check_status",
        data: {
          userId: config.userId,
          appId: config.appId,
        },
      };
      wsRef.current.send(JSON.stringify(checkStatusMessage));
    }
  }, [config.userId, config.appId]);

  const startPeriodicStatusCheck = useCallback(() => {
    // Arrêter l'intervalle existant s'il y en a un
    if (statusCheckIntervalRef.current) {
      clearInterval(statusCheckIntervalRef.current);
    }

    // Vérifier immédiatement au démarrage
    checkStatus();

    // Configurer la vérification périodique toutes les 4 secondes pour plus de réactivité
    statusCheckIntervalRef.current = setInterval(checkStatus, 4 * 1000);
  }, [checkStatus]);

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
      // Démarrer la vérification périodique du statut
      startPeriodicStatusCheck();
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
        case "status_response":
          const statusResponse = message as StatusResponse;
          setStatus(statusResponse);
          config.onStatusResponse?.(statusResponse);

          // Gérer les différents cas d'erreur et mettre à jour le statut immédiatement
          if (!statusResponse.payload.success) {
            if (!statusResponse.payload.status.userExists) {
              navigate(NHX_CONFIG._app_endpoints_.__AUTH__.__LOGIN__);
            } else if (!statusResponse.payload.status.appExists) {
              setConnectionError("L'application n'existe plus");
            } else if (!statusResponse.payload.status.userHasAccess) {
              // navigate(NHX_CONFIG._app_endpoints_.__OTHER__.__UNAUTHORIZED__);
            } else if (!statusResponse.payload.status.appIsActive) {
              setConnectionError("L'application est actuellement inactive");
              // Vérifier à nouveau le statut après un court délai
              setTimeout(checkStatus, 2000);
            }
          } else {
            // Si la vérification est réussie, on relance l'authentification
            setConnectionError(undefined);
            ws.send(
              JSON.stringify({
                type: "auth",
                data: {
                  userId: config.userId,
                  appId: config.appId,
                },
              })
            );
          }
          break;
        case "auth_success":
          setIsAuthenticated(true);
          config.onAuthSuccess?.();
          // Demander les actions après l'authentification
          ws.send(JSON.stringify({ type: "get_last_actions" }));
          break;
        case "auth_error":
          setIsAuthenticated(false);
          config.onAuthError?.(message.payload.message);
          ws.send(
            JSON.stringify({
              type: "auth",
              data: {
                userId: config.userId,
                appId: config.appId,
              },
            })
          );
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
            console.warn("metrics in useWebSocket: ", message.payload);
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
  }, [
    config.wsUrl,
    config.userId,
    config.appId,
    reconnectAttempts,
    startPeriodicStatusCheck,
  ]);

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
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, [connect]);

  // Gestion des erreurs de connexion
  useEffect(() => {
    console.warn("test");
    if (!wsRef.current) return;

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
      config.onConnectionError?.("Erreur de connexion WebSocket");
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket connection closed");
      setIsConnected(false);
      config.onConnectionError?.("Unable to connect to nehonx server");

      // Tentative de reconnexion automatique après 5 secondes
      setTimeout(() => {
        if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
          connect();
        }
      }, 5000);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.onerror = null;
        wsRef.current.onclose = null;
      }
    };
  }, [wsRef.current]);

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
    checkStatus,
    status,
  };
};
