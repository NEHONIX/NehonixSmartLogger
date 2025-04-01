import os from "os";
import { EventEmitter } from "events";
import { MonitoringConfig, PerformanceMetrics } from "../types/type";
export class PerformanceMonitoringService extends EventEmitter {
  private static instance: PerformanceMonitoringService;
  private config: MonitoringConfig;
  private metrics: PerformanceMetrics;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private lastMetrics: PerformanceMetrics | null = null;
  private eventCount: number = 0;
  private lastEventReset: number = Date.now();

  private constructor() {
    super();
    this.config = {
      enabled: false,
      samplingRate: 100,
      maxEventsPerSecond: 100,
      monitorMemory: true,
      monitorCPU: true,
      monitorNetwork: true,
    };
    this.metrics = this.initializeMetrics();
  }

  public static getInstance(): PerformanceMonitoringService {
    if (!PerformanceMonitoringService.instance) {
      PerformanceMonitoringService.instance =
        new PerformanceMonitoringService();
    }
    return PerformanceMonitoringService.instance;
  }

  private initializeMetrics(): PerformanceMetrics {
    return {
      cpu: {
        usage: 0,
        cores: os.cpus().length,
        loadAverage: os.loadavg(),
      },
      memory: {
        total: os.totalmem(),
        used: os.totalmem() - os.freemem(),
        free: os.freemem(),
        usagePercent: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100,
      },
      process: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
      },
      network: {
        interfaces: this.getNetworkInterfaces(),
      },
    };
  }

  private getNetworkInterfaces(): Record<string, any> {
    const interfaces = os.networkInterfaces();
    const result: Record<string, any> = {};

    for (const [name, details] of Object.entries(interfaces)) {
      if (details) {
        result[name] = {
          bytesReceived: 0,
          bytesSent: 0,
          packetsReceived: 0,
          packetsSent: 0,
        };
      }
    }

    return result;
  }

  public async initialize(config: MonitoringConfig): Promise<void> {
    this.config = config;
    if (config.enabled) {
      await this.startMonitoring();
    }
  }

  private async startMonitoring(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    // Mettre à jour les métriques toutes les secondes
    this.monitoringInterval = setInterval(() => {
      this.updateMetrics();
    }, 1000);
  }

  private updateMetrics(): void {
    if (!this.shouldEmitEvent()) {
      return;
    }

    this.metrics = {
      cpu: {
        usage: this.getCPUUsage(),
        cores: os.cpus().length,
        loadAverage: os.loadavg(),
      },
      memory: {
        total: os.totalmem(),
        used: os.totalmem() - os.freemem(),
        free: os.freemem(),
        usagePercent: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100,
      },
      process: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
      },
      network: {
        interfaces: this.getNetworkInterfaces(),
      },
    };

    this.emit("metrics", this.metrics);
    this.lastMetrics = this.metrics;
  }

  private shouldEmitEvent(): boolean {
    // Vérifier le taux d'échantillonnage
    if (Math.random() * 100 > this.config.samplingRate) {
      return false;
    }

    // Réinitialiser le compteur d'événements chaque seconde
    const now = Date.now();
    if (now - this.lastEventReset >= 1000) {
      this.eventCount = 0;
      this.lastEventReset = now;
    }

    // Vérifier la limite d'événements par seconde
    if (this.eventCount >= this.config.maxEventsPerSecond) {
      return false;
    }

    this.eventCount++;
    return true;
  }

  private getCPUUsage(): number {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    for (const cpu of cpus) {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    }

    return ((totalTick - totalIdle) / totalTick) * 100;
  }

  public getCurrentMetrics(): PerformanceMetrics {
    return this.metrics;
  }

  public async shutdown(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
}

// export { MonitoringConfig, PerformanceMetrics } from "../types/type";
