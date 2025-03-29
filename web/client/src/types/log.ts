export type LogLevel = "error" | "warn" | "info" | "debug";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  source?: string;
  context?: {
    [key: string]: any;
  };
}
