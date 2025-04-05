import { CreateAppConfig } from "../../../types/app";

export const defaultAppConfig: CreateAppConfig = {
  logLevel: "info" as const,
  encryption: {
    enabled: false,
    key: "",
  },
  console: {
    enabled: true,
    showTimestamp: true,
    showLogLevel: true,
    colorized: true,
    format: "simple" as const,
  },
  persistence: {
    enabled: true,
    maxSize: 100,
    rotationInterval: "daily" as const,
    retentionPeriod: 30,
    compressArchives: true,
    maxFiles: 10,
  },
  network: {
    batchSize: 50,
    retryAttempts: 3,
    retryDelay: 1000,
    timeout: 5000,
    offlineStorage: true,
    maxOfflineSize: 50,
  },
  performance: {
    enabled: true,
    samplingRate: 10,
    maxEventsPerSecond: 100,
    monitorMemory: true,
    monitorCPU: true,
  },
  monitoring: {
    enabled: true,
    samplingRate: 10,
    maxEventsPerSecond: 100,
    monitorMemory: true,
    monitorCPU: true,
    monitorNetwork: true,
  },
};
