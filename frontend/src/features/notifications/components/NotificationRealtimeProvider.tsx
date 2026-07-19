import { useEffect } from "react";

import { notificationHubUrl } from "@/config/api";
import { useAuthStore } from "@/features/auth";
import { useToastStore } from "@/shared/store/toastStore";

import { createNotificationSignalRClient } from "../services/notificationSignalRClient";
import { useNotificationStore } from "../store/notificationStore";

function NotificationRealtimeProvider() {
  const session = useAuthStore((state) => state.session);
  const receiveNotification = useNotificationStore(
    (state) => state.receiveNotification,
  );
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
  const resetNotifications = useNotificationStore((state) => state.reset);
  const loadUnreadCount = useNotificationStore((state) => state.loadUnreadCount);
  const showToast = useToastStore((state) => state.showToast);

  useEffect(() => {
    if (!session?.accessToken) {
      resetNotifications();
      return;
    }

    void loadUnreadCount().catch(() => {
      // The notification page will surface API errors when users open it.
    });

    let isCurrent = true;
    const client = createNotificationSignalRClient({
      accessToken: session.accessToken,
      hubUrl: notificationHubUrl,
      onNotificationReceived: (notification) => {
        if (!isCurrent) {
          return;
        }

        receiveNotification(notification);
        showToast({
          title: notification.title,
          description: notification.message,
          variant: "success",
        });
      },
      onUnreadCountUpdated: (count) => {
        if (isCurrent) {
          setUnreadCount(count);
        }
      },
    });

    const connect = async () => {
      try {
        await client.start();
      } catch {
        // Users can still load notifications through the REST API.
      }
    };

    void connect();

    return () => {
      isCurrent = false;
      void client.stop();
    };
  }, [
    loadUnreadCount,
    receiveNotification,
    resetNotifications,
    session?.accessToken,
    setUnreadCount,
    showToast,
  ]);

  return null;
}

export { NotificationRealtimeProvider };
