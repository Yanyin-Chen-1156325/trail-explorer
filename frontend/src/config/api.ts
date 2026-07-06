const defaultApiBaseUrl = "/api";

export const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") ?? defaultApiBaseUrl;

export const authApiBaseUrl = `${apiBaseUrl}/auth`;
export const usersApiBaseUrl = `${apiBaseUrl}/users`;
