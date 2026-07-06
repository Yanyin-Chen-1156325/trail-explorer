export type AuthRole = "User" | "Admin" | "Moderator";

export interface AuthResponse {
  userId: string;
  email: string;
  displayName: string;
  role: AuthRole;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleOAuthRequest {
  idToken: string;
  createAccount: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ApiErrorResponse {
  message: string;
}
