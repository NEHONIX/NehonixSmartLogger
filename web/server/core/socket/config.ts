export interface WebSocketServerConfig {
  port: number;
  host: string;
  maxConnections: number;
  heartbeatInterval: number; // en millisecondes
  reconnectAttempts: number;
}

export const defaultConfig: WebSocketServerConfig = {
  port: 8087,
  host: "localhost",
  maxConnections: 100,
  heartbeatInterval: 30000, // 30 secondes
  reconnectAttempts: 5,
};

export interface LogStreamOptions {
  bufferSize: number;
  batchSize: number;
  flushInterval: number; // en millisecondes
}

export const defaultStreamOptions: LogStreamOptions = {
  bufferSize: 1000, // nombre maximum de logs en mémoire
  batchSize: 50, // nombre de logs envoyés par batch
  flushInterval: 1000, // intervalle d'envoi des logs
};
