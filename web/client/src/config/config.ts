import { NHX_CONFIG } from "./app.conf";

export interface WebInterfaceConfig {
  wsUrl: string;
  refreshInterval: number;
  maxLogEntries: number;
  theme: "light" | "dark";
  dateFormat: string;
  autoReconnect: boolean;
  reconnectAttempts: number;
  reconnectInterval: number;
}

export const defaultConfig: WebInterfaceConfig = {
  wsUrl: NHX_CONFIG._global_.__WEBSOCKET_URL__,
  refreshInterval: 1000,
  maxLogEntries: 1000,
  theme: "light",
  dateFormat: "HH:mm:ss.SSS",
  autoReconnect: true,
  reconnectAttempts: 5,
  reconnectInterval: 2000,
};
