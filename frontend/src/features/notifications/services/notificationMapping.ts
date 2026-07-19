import type {
  Notification,
  NotificationType,
  RawNotification,
  RawNotificationType,
} from "../types/notification";

const notificationTypeLabels: NotificationType[] = [
  "BadgeUnlocked",
  "XpGained",
  "LevelUp",
  "WeeklyStreak",
];

export function normalizeNotificationType(
  value: RawNotificationType,
): NotificationType {
  if (typeof value === "string") {
    return value;
  }

  return notificationTypeLabels[value] ?? notificationTypeLabels[0];
}

export function normalizeNotification(
  notification: RawNotification,
): Notification {
  return {
    ...notification,
    type: normalizeNotificationType(notification.type),
  };
}
