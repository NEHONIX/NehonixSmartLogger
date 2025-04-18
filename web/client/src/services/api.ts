import axios from "axios";
import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  LoginResponse,
  RegisterResponse,
} from "../types/auth";
import { NHX_CONFIG } from "../config/app.conf";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:2798/api/logger";

// Création de l'instance Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important pour les cookies de session
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // window.location.href = NHX_CONFIG._app_endpoints_.__AUTH__.__LOGIN__;
      console.error("unauthorized");
    }
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/login", credentials);
    return response.data;
  },

  register: async (data: RegisterCredentials): Promise<RegisterResponse> => {
    const deviceInfo = await NHX_CONFIG._global_.__GET_SYS_INFO__();
    const response = await api.post<RegisterResponse>("/auth/register", {
      registerRequest: data,
      deviceInfo,
    });
    console.log("register resoonse", response);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  checkAuth: async (): Promise<AuthResponse> => {
    const response = await api.get<{ data: AuthResponse }>("/auth/check-auth");
    return response.data.data;
  },
};

export default api;
