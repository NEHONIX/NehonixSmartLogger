export type LogLevel = "error" | "warn" | "info" | "debug" | "log";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

export interface LogStats {
  total: number;
  byLevel: Record<LogLevel, number>;
  errorRate: number;
}
