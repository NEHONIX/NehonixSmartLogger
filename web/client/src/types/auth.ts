export type UserTarget = "dev" | "entreprise" | "guest";

export interface User {
  id: string;
  email: string;
  target: UserTarget;
  entrepriseName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  confirmPassword: string;
  target: UserTarget;
  entrepriseName?: string;
}

export interface AuthError {
  field?: string;
  message: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
