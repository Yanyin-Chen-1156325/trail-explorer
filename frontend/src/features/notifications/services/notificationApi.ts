import type {
  Notification,
  RawNotification,
  UnreadNotificationCountResponse,
} from "../types/notification";
import { normalizeNotification } from "./notificationMapping";

export class NotificationApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "NotificationApiError";
    this.status = status;
  }
}

export interface NotificationApi {
  getMyNotifications(accessToken: string): Promise<Notification[]>;
  getUnreadNotificationCount(accessToken: string): Promise<number>;
  markNotificationAsRead(
    accessToken: string,
    notificationId: string,
  ): Promise<Notification>;
  markAllNotificationsAsRead(accessToken: string): Promise<void>;
}

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { message?: string } | null;
    if (payload?.message) {
      return payload.message;
    }
  } catch {
    // Fall back to the HTTP status text below.
  }

  return response.statusText || "Request failed";
}

async function requestJson<TResponse>(
  url: string,
  accessToken: string,
  method = "GET",
): Promise<TResponse> {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new NotificationApiError(
      await readErrorMessage(response),
      response.status,
    );
  }

  return (await response.json()) as TResponse;
}

async function requestEmpty(
  url: string,
  accessToken: string,
  method: string,
): Promise<void> {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new NotificationApiError(
      await readErrorMessage(response),
      response.status,
    );
  }
}

export function createNotificationApi(
  baseUrl: string = "/api/notifications",
): NotificationApi {
  const normalizedBaseUrl = trimTrailingSlash(baseUrl);

  return {
    async getMyNotifications(accessToken) {
      const notifications = await requestJson<RawNotification[]>(
        `${normalizedBaseUrl}/me`,
        accessToken,
      );

      return notifications.map(normalizeNotification);
    },
    async getUnreadNotificationCount(accessToken) {
      const response = await requestJson<UnreadNotificationCountResponse>(
        `${normalizedBaseUrl}/unread-count`,
        accessToken,
      );

      return response.count;
    },
    async markNotificationAsRead(accessToken, notificationId) {
      const notification = await requestJson<RawNotification>(
        `${normalizedBaseUrl}/${notificationId}/read`,
        accessToken,
        "PUT",
      );

      return normalizeNotification(notification);
    },
    async markAllNotificationsAsRead(accessToken) {
      await requestEmpty(`${normalizedBaseUrl}/read-all`, accessToken, "PUT");
    },
  };
}
