import type { Notification } from "./types/notification";

function createNotification(
  overrides: Partial<Notification> = {},
): Notification {
  return {
    id: "notification-1",
    type: "XpGained",
    title: "XP gained",
    message: "You gained 120 XP from your latest trail.",
    isRead: false,
    createdAt: "2026-07-19T08:00:00.000Z",
    ...overrides,
  };
}

export { createNotification };
