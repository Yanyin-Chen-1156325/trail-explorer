const defaultApiBaseUrl = "/api";

export const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") ?? defaultApiBaseUrl;

export const authApiBaseUrl = `${apiBaseUrl}/auth`;
export const trailsApiBaseUrl = `${apiBaseUrl}/trails`;
export const usersApiBaseUrl = `${apiBaseUrl}/users`;
export const checkInsApiBaseUrl = `${apiBaseUrl}/checkins`;
export const badgesApiBaseUrl = `${apiBaseUrl}/badges`;
export const dashboardApiBaseUrl = `${apiBaseUrl}/dashboard`;
export const adminApiBaseUrl = `${apiBaseUrl}/admin`;
export const leaderboardApiBaseUrl = `${apiBaseUrl}/leaderboard`;
export const notificationsApiBaseUrl = `${apiBaseUrl}/notifications`;

export const leaderboardHubUrl = import.meta.env.VITE_API_BASE_URL
  ? `${new URL(import.meta.env.VITE_API_BASE_URL).origin}/hubs/leaderboard`
  : "/hubs/leaderboard";

export const notificationHubUrl = import.meta.env.VITE_API_BASE_URL
  ? `${new URL(import.meta.env.VITE_API_BASE_URL).origin}/hubs/notifications`
  : "/hubs/notifications";
