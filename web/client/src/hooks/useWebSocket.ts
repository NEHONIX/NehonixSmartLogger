import { useEffect, useRef, useState, useCallback } from "react";
import { WebInterfaceConfig } from "../config/config";

interface WebSocketHookOptions {
  onMessage?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

interface WebSocketHookResult {
  isConnected: boolean;
  sendMessage: (data: any) => void;
}

export const useWebSocket = (
  config: WebInterfaceConfig,
  options: WebSocketHookOptions = {}
): WebSocketHookResult => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }

      const ws = new WebSocket(config.wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connecté");
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        options.onConnect?.();
      };

      ws.onclose = () => {
        console.log("WebSocket déconnecté");
        setIsConnected(false);
        options.onDisconnect?.();

        if (
          config.autoReconnect &&
          reconnectAttemptsRef.current < config.reconnectAttempts
        ) {
          console.log(
            `Tentative de reconnexion ${reconnectAttemptsRef.current + 1}/${
              config.reconnectAttempts
            }...`
          );
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, config.reconnectInterval);
        } else if (reconnectAttemptsRef.current >= config.reconnectAttempts) {
          console.log("Nombre maximum de tentatives de reconnexion atteint");
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          options.onMessage?.(data);
        } catch (error) {
          console.error("Erreur lors du parsing des données:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("Erreur WebSocket:", error);
        options.onError?.(error);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Erreur lors de la connexion WebSocket:", error);
    }
  }, [
    config.wsUrl,
    config.autoReconnect,
    config.reconnectAttempts,
    config.reconnectInterval,
    options,
  ]);

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
  }, [connect]);

  const sendMessage = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn("WebSocket non connecté, impossible d'envoyer le message");
    }
  }, []);

  return { isConnected, sendMessage };
};
