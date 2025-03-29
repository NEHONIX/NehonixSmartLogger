export enum LogLevel {
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  DEBUG = "debug",
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
}

export interface LogStats {
  total: number;
  byLevel: Record<LogLevel, number>;
  errorRate: number;
}

export interface WebInterfaceConfig {
  wsUrl: string;
  refreshInterval: number;
  maxLogEntries: number;
  theme: "light" | "dark";
  dateFormat: string;
  autoReconnect: boolean;
  reconnectInterval: number;
  logRetentionDays: number;
}
