interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: number;
  success: boolean;
  error?: string;
}

export interface MetricsSummary {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageDuration: number;
  maxDuration: number;
  minDuration: number;
  errorRate: number;
  metrics: PerformanceMetric[];
}

export class MetricsCollector {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics: number;

  constructor(maxMetrics: number = 1000) {
    this.maxMetrics = maxMetrics;
  }

  public startOperation(operation: string): number {
    return performance.now();
  }

  public endOperation(
    operation: string,
    startTime: number,
    success: boolean = true,
    error?: string
  ): void {
    const duration = performance.now() - startTime;

    this.addMetric({
      operation,
      duration,
      timestamp: Date.now(),
      success,
      error,
    });
  }

  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  public getMetrics(): MetricsSummary {
    const total = this.metrics.length;
    if (total === 0) {
      return {
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        averageDuration: 0,
        maxDuration: 0,
        minDuration: 0,
        errorRate: 0,
        metrics: [],
      };
    }

    const successful = this.metrics.filter((m) => m.success).length;
    const durations = this.metrics.map((m) => m.duration);

    return {
      totalOperations: total,
      successfulOperations: successful,
      failedOperations: total - successful,
      averageDuration: this.calculateAverage(durations),
      maxDuration: Math.max(...durations),
      minDuration: Math.min(...durations),
      errorRate: (total - successful) / total,
      metrics: [...this.metrics],
    };
  }

  public getMetricsByOperation(operation: string): MetricsSummary {
    const operationMetrics = this.metrics.filter(
      (m) => m.operation === operation
    );
    const collector = new MetricsCollector(this.maxMetrics);
    operationMetrics.forEach((m) => collector.addMetric(m));
    return collector.getMetrics();
  }

  public clear(): void {
    this.metrics = [];
  }

  private calculateAverage(numbers: number[]): number {
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  public getRecentMetrics(duration: number = 3600000): MetricsSummary {
    const now = Date.now();
    const collector = new MetricsCollector(this.maxMetrics);

    this.metrics
      .filter((m) => now - m.timestamp <= duration)
      .forEach((m) => collector.addMetric(m));

    return collector.getMetrics();
  }
}
