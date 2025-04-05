import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { MetricsData } from "../../../types/metrics";
import "./MetricsChart.scss";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Props {
  data: MetricsData[];
  timeRange: string;
}

const MetricsChart: React.FC<Props> = ({ data, timeRange }) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return timeRange === "Last hour"
      ? date.toLocaleTimeString()
      : date.toLocaleString();
  };

  const chartData = {
    labels: data.map((d) => formatTime(d.timestamp)),
    datasets: [
      {
        label: "CPU (%)",
        data: data.map((d) => d.cpu),
        borderColor: "#007bff",
        backgroundColor: "rgba(0, 123, 255, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Mémoire (%)",
        data: data.map((d) => d.memory),
        borderColor: "#28a745",
        backgroundColor: "rgba(40, 167, 69, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Requêtes/s",
        data: data.map((d) => d.requests),
        borderColor: "#ffc107",
        backgroundColor: "rgba(255, 193, 7, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          boxWidth: 6,
        },
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#666",
        bodyColor: "#333",
        borderColor: "rgba(0, 0, 0, 0.1)",
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
    },
    animation: {
      duration: 300,
    },
  };

  const latestData = data[data.length - 1] || {
    cpu: 0,
    memory: 0,
    requests: 0,
  };

  return (
    <div className="metrics-chart">
      <div style={{ height: "400px", marginBottom: "20px" }}>
        <Line data={chartData} options={options} />
      </div>

      <div className="metrics-summary">
        <div className="metric-card">
          <h4>CPU</h4>
          <div className="current-value">{latestData.cpu.toFixed(1)}%</div>
        </div>
        <div className="metric-card">
          <h4>Mémoire</h4>
          <div className="current-value">{latestData.memory.toFixed(1)}%</div>
        </div>
        <div className="metric-card">
          <h4>Requêtes/s</h4>
          <div className="current-value">{latestData.requests}</div>
        </div>
      </div>
    </div>
  );
};

export default MetricsChart;
