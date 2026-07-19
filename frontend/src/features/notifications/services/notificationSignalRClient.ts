import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";

import type {
  RawNotification,
  UnreadNotificationCountResponse,
} from "../types/notification";
import { normalizeNotification } from "./notificationMapping";
import type { Notification } from "../types/notification";

interface NotificationSignalRClientOptions {
  accessToken: string;
  hubUrl: string;
  onNotificationReceived?: (notification: Notification) => void;
  onUnreadCountUpdated?: (count: number) => void;
}

export interface NotificationSignalRClient {
  start(): Promise<void>;
  stop(): Promise<void>;
}

export function createNotificationSignalRClient({
  accessToken,
  hubUrl,
  onNotificationReceived,
  onUnreadCountUpdated,
}: NotificationSignalRClientOptions): NotificationSignalRClient {
  const connection: HubConnection = new HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => accessToken,
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();

  connection.on("NotificationReceived", (notification: RawNotification) => {
    onNotificationReceived?.(normalizeNotification(notification));
  });

  connection.on(
    "UnreadNotificationCountUpdated",
    (response: UnreadNotificationCountResponse) => {
      onUnreadCountUpdated?.(response.count);
    },
  );

  return {
    async start() {
      if (connection.state === HubConnectionState.Disconnected) {
        await connection.start();
      }
    },
    async stop() {
      if (connection.state !== HubConnectionState.Disconnected) {
        await connection.stop();
      }
    },
  };
}
