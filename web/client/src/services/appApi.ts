import {
  CreateAppRequest,
  CreateAppResponse,
  AppListResponse,
  PerformanceMetrics,
  LogEntry,
} from "../types/app";
import api from "./api";

export const appApi = {
  createApp: async (data: CreateAppRequest): Promise<CreateAppResponse> => {
    const response = await api.post<CreateAppResponse>("/apps/create", data);
    return response.data;
  },

  listApps: async (listAppsProps: listAppsProps): Promise<AppListResponse> => {
    const url = `/apps/list${
      listAppsProps.opt?.useCache ?? true ? "?useCache=true" : ""
    }`;
    const response = await api.get<{ data: AppListResponse }>(url);
    return response.data.data;
  },

  toggleAppStatus: async (toogleStatusProps: toogleStatusProps) => {
    const { appId, status } = toogleStatusProps;
    const res = await api.patch(`/apps/${appId}/status`, { status });
    return res;
  },

  getMetrics: async (
    appId: string,
    timeRange: "hour" | "day" | "week"
  ): Promise<PerformanceMetrics> => {
    const response = await api.get<PerformanceMetrics>(
      `/apps/${appId}/metrics?timeRange=${timeRange}`
    );
    return response.data;
  },

  getLogs: async (
    appId: string,
    timeRange: "hour" | "day" | "week"
  ): Promise<LogEntry[]> => {
    const response = await api.get<LogEntry[]>(
      `/apps/${appId}/logs?timeRange=${timeRange}`
    );
    return response.data;
  },

  deleteApp: async (appId: string): Promise<void> => {
    await api.delete(`/apps/${appId}/delete`);
  },

  downloadConfig: async (appId: string): Promise<Blob> => {
    const response = await api.get(`/apps/${appId}/download-config`, {
      responseType: "blob",
    });
    return response.data;
  },
};

export interface listAppOpt {
  useCache?: boolean;
}

export interface toogleStatusProps {
  appId: string;
  status: "active" | "inactive";
}

export interface listAppsProps {
  opt?: listAppOpt;
}
