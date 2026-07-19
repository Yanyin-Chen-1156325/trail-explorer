import { create } from "zustand";

import { notificationsApiBaseUrl } from "@/config/api";
import { runAuthenticatedRequest } from "@/features/auth";

import {
  createNotificationApi,
  NotificationApiError,
} from "../services/notificationApi";
import type { Notification } from "../types/notification";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  loadNotifications: () => Promise<void>;
  loadUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  receiveNotification: (notification: Notification) => void;
  setUnreadCount: (count: number) => void;
  reset: () => void;
}

const notificationApi = createNotificationApi(notificationsApiBaseUrl);

function getErrorMessage(error: unknown): string {
  if (error instanceof NotificationApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
}

function upsertNotification(
  notifications: Notification[],
  notification: Notification,
) {
  const existingIndex = notifications.findIndex(
    (current) => current.id === notification.id,
  );

  if (existingIndex >= 0) {
    return notifications.map((current) =>
      current.id === notification.id ? notification : current,
    );
  }

  return [notification, ...notifications].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  loadNotifications: async () => {
    set({ isLoading: true, error: null });

    try {
      const notifications = await runAuthenticatedRequest((accessToken) =>
        notificationApi.getMyNotifications(accessToken),
      );
      set({
        notifications,
        unreadCount: notifications.filter((notification) => !notification.isRead)
          .length,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },
  loadUnreadCount: async () => {
    try {
      const unreadCount = await runAuthenticatedRequest((accessToken) =>
        notificationApi.getUnreadNotificationCount(accessToken),
      );
      set({ unreadCount, error: null });
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },
  markAsRead: async (notificationId) => {
    const notification = await runAuthenticatedRequest((accessToken) =>
      notificationApi.markNotificationAsRead(accessToken, notificationId),
    );

    set((state) => ({
      notifications: upsertNotification(state.notifications, notification),
      unreadCount: state.notifications.some(
        (current) => current.id === notificationId && !current.isRead,
      )
        ? Math.max(0, state.unreadCount - 1)
        : state.unreadCount,
      error: null,
    }));
  },
  markAllAsRead: async () => {
    await runAuthenticatedRequest((accessToken) =>
      notificationApi.markAllNotificationsAsRead(accessToken),
    );

    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        isRead: true,
      })),
      unreadCount: 0,
      error: null,
    }));
  },
  receiveNotification: (notification) => {
    set((state) => ({
      notifications: upsertNotification(state.notifications, notification),
      unreadCount: notification.isRead
        ? state.unreadCount
        : state.unreadCount + 1,
      error: null,
    }));
  },
  setUnreadCount: (count) => set({ unreadCount: count }),
  reset: () =>
    set({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
    }),
}));
