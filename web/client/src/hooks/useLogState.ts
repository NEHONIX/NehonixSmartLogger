import { useState, useCallback, useMemo } from "react";
import { LogEntry, LogLevel } from "../types/log";
import { WebInterfaceConfig } from "../config/config";

interface LogFilter {
  search: string;
  level: LogLevel | "all";
  startTime?: Date;
  endTime?: Date;
}
 
interface UseLogStateResult {
  logs: LogEntry[];
  filteredLogs: LogEntry[];
  filter: LogFilter;
  setFilter: (filter: Partial<LogFilter>) => void;
  addLogs: (newLogs: LogEntry[]) => void;
  clearLogs: () => void;
  stats: {
    total: number;
    byLevel: Record<LogLevel, number>;
    errorRate: number;
  };
}

export const useLogState = (config: WebInterfaceConfig): UseLogStateResult => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<LogFilter>({
    search: "",
    level: "all",
  });

  const addLogs = useCallback(
    (newLogs: LogEntry[]) => {
      setLogs((prevLogs) => {
        const updatedLogs = [...prevLogs, ...newLogs];
        // Maintenir la limite de logs en mémoire
        if (updatedLogs.length > config.maxLogEntries) {
          return updatedLogs.slice(-config.maxLogEntries);
        }
        return updatedLogs;
      });
    },
    [config.maxLogEntries]
  );

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const updateFilter = useCallback((newFilter: Partial<LogFilter>) => {
    setFilter((prev) => ({ ...prev, ...newFilter }));
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = filter.search
        ? log.message.toLowerCase().includes(filter.search.toLowerCase()) ||
          JSON.stringify(log.data)
            .toLowerCase()
            .includes(filter.search.toLowerCase())
        : true;

      const matchesLevel = filter.level === "all" || log.level === filter.level;

      const matchesTimeRange =
        (!filter.startTime || new Date(log.timestamp) >= filter.startTime) &&
        (!filter.endTime || new Date(log.timestamp) <= filter.endTime);

      return matchesSearch && matchesLevel && matchesTimeRange;
    });
  }, [logs, filter]);

  const stats = useMemo(() => {
    const byLevel = logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<LogLevel, number>);

    const total = logs.length;
    const errorCount = byLevel.error || 0;
    const errorRate = total > 0 ? errorCount / total : 0;

    return {
      total,
      byLevel,
      errorRate,
    };
  }, [logs]);

  return {
    logs,
    filteredLogs,
    filter,
    setFilter: updateFilter,
    addLogs,
    clearLogs,
    stats,
  };
};
