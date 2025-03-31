import React, { useState, useCallback } from "react";
import { LogViewer } from "../../components/logs/LogViewer/LogViewer";
import {
  LogFilter,
  LogFilterState,
} from "../../components/logs/LogFilter/LogFilter";
import { LogStats } from "../../components/logs/LogStats/LogStats";
import { useWebSocket } from "../../hooks/useWebSocket";
import { useLogState } from "../../hooks/useLogState";
import { defaultConfig } from "../../config/config";
import "./LiveLogs.scss";

export const LiveLogs: React.FC = () => {
  const [filter, setFilter] = useState<LogFilterState>({
    searchQuery: "",
    logLevel: "",
    startTime: "",
    endTime: "",
  });

  const { logs, stats, addLogs } = useLogState(defaultConfig);

  console.log({
    logs,
    stats,
  });
  const handleMessage = useCallback(
    (data: any) => {
      if (Array.isArray(data)) {
        addLogs(data);
      } else {
        addLogs([data]);
      }
    },
    [addLogs]
  );

  const { isConnected } = { isConnected: true }; //juste pour le test de la connexion
  /**
   * useWebSocket();
   */

  // Filtrer les logs en fonction des critères
  const filteredLogs = logs.filter((log) => {
    if (
      filter.searchQuery &&
      !log.message.toLowerCase().includes(filter.searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (filter.logLevel && log.level !== filter.logLevel) {
      return false;
    }
    if (
      filter.startTime &&
      new Date(log.timestamp) < new Date(filter.startTime)
    ) {
      return false;
    }
    if (filter.endTime && new Date(log.timestamp) > new Date(filter.endTime)) {
      return false;
    }
    return true;
  });

  return (
    <div className="live-logs">
      <div className="live-logs__header">
        <LogStats stats={stats} />
        <LogFilter filter={filter} onFilterChange={setFilter} />
      </div>
      <div className="live-logs__content">
        <LogViewer logs={filteredLogs} isConnected={isConnected} />
      </div>
    </div>
  );
};
