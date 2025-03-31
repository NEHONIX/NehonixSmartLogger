import { App, PerformanceMetrics, LogEntry } from "./app";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface CreateAppRequest {
  name: string;
  description: string;
}

export interface CreateAppResponse {
  app: App;
}

export interface ListAppsResponse {
  apps: App[];
}

export interface GetAppResponse {
  app: App;
}

export interface UpdateAppRequest {
  name?: string;
  description?: string;
}

export interface UpdateAppResponse {
  app: App;
}

export interface GetMetricsResponse {
  metrics: PerformanceMetrics;
}

export interface GetLogsResponse {
  logs: LogEntry[];
}

export interface AppConfig {
  persistence: {
    enabled: boolean;
    maxFileSize: number;
    maxFiles: number;
    compression: boolean;
  };
  monitoring: {
    enabled: boolean;
    interval: number;
    metrics: string[];
  };
  websocket: {
    enabled: boolean;
    port: number;
    authentication: boolean;
  };
  security: {
    encryption: boolean;
    keyRotation: boolean;
    sensitiveFields: string[];
  };
}

export interface GetConfigResponse {
  config: AppConfig;
}

export interface UpdateConfigRequest {
  config: AppConfig;
}

export interface UpdateConfigResponse {
  config: AppConfig;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface RegisterResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}
