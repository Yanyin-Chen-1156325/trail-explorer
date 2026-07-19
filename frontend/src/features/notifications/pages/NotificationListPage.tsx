import { useEffect } from "react";
import {
  AlertCircle,
  Award,
  Bell,
  CheckCheck,
  CheckCircle2,
  Flame,
  Loader2,
  Sparkles,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToastStore } from "@/shared/store/toastStore";

import { useNotificationStore } from "../store/notificationStore";
import type { Notification, NotificationType } from "../types/notification";

const notificationIcons = {
  BadgeUnlocked: Award,
  XpGained: Sparkles,
  LevelUp: Star,
  WeeklyStreak: Flame,
} satisfies Record<NotificationType, typeof Award>;

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function NotificationItem({
  notification,
  onMarkAsRead,
}: {
  notification: Notification;
  onMarkAsRead: (notificationId: string) => void;
}) {
  const Icon = notificationIcons[notification.type];

  return (
    <Card
      className={`border text-white shadow-xl shadow-black/20 ${
        notification.isRead
          ? "border-white/10 bg-[#071511]"
          : "border-emerald-300/25 bg-emerald-400/10"
      }`}
    >
      <CardContent className="grid gap-4 p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-start">
        <div className="flex size-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-[#86EFAC]">
          <Icon aria-hidden="true" className="size-5" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-black">{notification.title}</h2>
            {!notification.isRead ? (
              <span className="rounded-lg border border-emerald-300/25 bg-emerald-300/10 px-2 py-0.5 text-xs font-bold text-emerald-100">
                Unread
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm leading-6 text-[#CBD5E1]">
            {notification.message}
          </p>
          <p className="mt-3 text-xs font-semibold uppercase text-[#94A3B8]">
            {formatDate(notification.createdAt)}
          </p>
        </div>
        {!notification.isRead ? (
          <Button
            className="border-white/15 bg-white/5 text-white hover:bg-white/10"
            type="button"
            variant="outline"
            onClick={() => onMarkAsRead(notification.id)}
          >
            <CheckCircle2 aria-hidden="true" className="size-4" />
            Mark read
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function NotificationListPage() {
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const isLoading = useNotificationStore((state) => state.isLoading);
  const error = useNotificationStore((state) => state.error);
  const loadNotifications = useNotificationStore(
    (state) => state.loadNotifications,
  );
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const showToast = useToastStore((state) => state.showToast);

  useEffect(() => {
    void loadNotifications().catch(() => {
      // Error state is stored and rendered below.
    });
  }, [loadNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch {
      showToast({
        title: "Notification not updated",
        description: "Try again in a moment.",
        variant: "error",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch {
      showToast({
        title: "Notifications not updated",
        description: "Try again in a moment.",
        variant: "error",
      });
    }
  };

  return (
    <main className="theme-page min-h-screen bg-[#0F172A] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold uppercase text-[#86EFAC]">
              <Bell aria-hidden="true" className="size-4" />
              Notifications
            </p>
            <h1 className="mt-3 text-3xl font-black sm:text-4xl">
              Achievement notification center
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#94A3B8] sm:text-base">
              Badge unlocks, XP gains, level ups, and streak milestones from
              your trail activity.
            </p>
          </div>

          <Button
            className="border-white/15 bg-white/5 text-white hover:bg-white/10"
            disabled={unreadCount === 0}
            type="button"
            variant="outline"
            onClick={handleMarkAllAsRead}
          >
            <CheckCheck aria-hidden="true" className="size-4" />
            Mark all read
          </Button>
        </section>

        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="border-white/10 bg-[#071511] text-white shadow-xl shadow-black/20">
            <CardContent className="p-5">
              <p className="text-xs font-bold uppercase text-[#94A3B8]">
                Unread
              </p>
              <p className="mt-2 text-3xl font-black text-[#86EFAC]">
                {unreadCount}
              </p>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-[#071511] text-white shadow-xl shadow-black/20 sm:col-span-2">
            <CardContent className="p-5">
              <p className="text-xs font-bold uppercase text-[#94A3B8]">
                Total notifications
              </p>
              <p className="mt-2 text-3xl font-black">
                {notifications.length}
              </p>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-white/10 bg-[#071511] text-[#94A3B8]">
            <Loader2 aria-hidden="true" className="mr-2 size-5 animate-spin" />
            Loading notifications
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-red-400/25 bg-red-500/10 p-8 text-center">
            <AlertCircle aria-hidden="true" className="size-10 text-red-300" />
            <h2 className="mt-4 text-lg font-bold">
              Notifications unavailable
            </h2>
            <p className="mt-2 max-w-md text-sm text-red-100/75">{error}</p>
            <Button
              className="mt-5 border-red-200/25 bg-red-50/10 text-red-50 hover:bg-red-50/15"
              type="button"
              variant="outline"
              onClick={() => {
                void loadNotifications();
              }}
            >
              Try again
            </Button>
          </div>
        ) : null}

        {!isLoading && !error ? (
          <section className="grid gap-3" aria-label="Notification list">
            {notifications.length === 0 ? (
              <div className="rounded-lg border border-white/10 bg-[#071511] p-8 text-center text-[#94A3B8]">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))
            )}
          </section>
        ) : null}
      </div>
    </main>
  );
}

export { NotificationListPage };
