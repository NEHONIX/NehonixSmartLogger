import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { PerformanceMetrics, TimeRange } from "../../../types/app";
import "./MetricsChart.scss";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MetricsChartProps {
  metrics: PerformanceMetrics;
  timeRange: TimeRange["type"];
}

export const MetricsChart: React.FC<MetricsChartProps> = ({
  metrics,
  timeRange,
}) => {
  console.log("metrics in metrics chart", metrics);
  // Vérification de sécurité pour les métriques
  const safeMetrics = {
    cpu: {
      usage: metrics?.cpu?.usage ?? 0,
      cores: metrics?.cpu?.cores ?? 0,
    },
    memory: {
      used: metrics?.memory?.used ?? 0,
      free: metrics?.memory?.free ?? 0,
    },
    disk: {
      used: metrics?.disk?.used ?? 0,
      free: metrics?.disk?.free ?? 0,
    },
    network: {
      bytesReceived:
        metrics?.network?.interfaces?.[
          Object.keys(metrics.network.interfaces)[0]
        ]?.bytesReceived ?? 0,
      bytesSent:
        metrics?.network?.interfaces?.[
          Object.keys(metrics.network.interfaces)[0]
        ]?.bytesSent ?? 0,
    },
  };
  console.log("safeMetrics in metrics chart", safeMetrics);

  const cpuData = {
    labels: ["CPU Usage"],
    datasets: [
      {
        label: "CPU Usage (%)",
        data: [safeMetrics.cpu.usage],
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const memoryData = {
    labels: ["Memory Usage"],
    datasets: [
      {
        label: "Used Memory (GB)",
        data: [safeMetrics.memory.used / 1024 / 1024 / 1024],
        borderColor: "rgb(255, 99, 132)",
        tension: 0.1,
      },
      {
        label: "Free Memory (GB)",
        data: [safeMetrics.memory.free / 1024 / 1024 / 1024],
        borderColor: "rgb(54, 162, 235)",
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Performance Metrics",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="metrics-chart">
      <div className="chart-container">
        <h3>CPU Usage</h3>
        <Line options={options} data={cpuData} />
      </div>
      <div className="chart-container">
        <h3>Memory Usage</h3>
        <Line options={options} data={memoryData} />
      </div>
      <div className="metrics-summary">
        <div className="metric-card">
          <h4>CPU</h4>
          <p>Usage: {safeMetrics.cpu?.usage.toFixed(2)}%</p>
          <p>Cores: {safeMetrics.cpu?.cores}</p>
        </div>
        <div className="metric-card">
          <h4>Memory</h4>
          <p>
            Used: {(safeMetrics.memory.used / 1024 / 1024 / 1024).toFixed(2)} GB
          </p>
          <p>
            Free: {(safeMetrics.memory.free / 1024 / 1024 / 1024).toFixed(2)} GB
          </p>
        </div>
        <div className="metric-card">
          <h4>Disk</h4>
          <p>
            Used: {(safeMetrics.disk.used / 1024 / 1024 / 1024).toFixed(2)} GB
          </p>
          <p>
            Free: {(safeMetrics.disk.free / 1024 / 1024 / 1024).toFixed(2)} GB
          </p>
        </div>
        <div className="metric-card">
          <h4>Network</h4>
          <p>
            Received:{" "}
            {(safeMetrics.network.bytesReceived / 1024 / 1024).toFixed(2)} MB
          </p>
          <p>
            Sent: {(safeMetrics.network.bytesSent / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      </div>
    </div>
  );
};
