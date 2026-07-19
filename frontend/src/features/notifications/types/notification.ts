export type NotificationType =
  | "BadgeUnlocked"
  | "XpGained"
  | "LevelUp"
  | "WeeklyStreak";

export type RawNotificationType = NotificationType | number;

export interface RawNotification {
  id: string;
  type: RawNotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface UnreadNotificationCountResponse {
  count: number;
}
