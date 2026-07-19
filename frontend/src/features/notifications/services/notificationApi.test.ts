import { describe, expect, it, vi } from "vitest";

import { createNotification } from "../testUtils";
import { createNotificationApi } from "./notificationApi";

describe("notificationApi", () => {
  it("normalizes numeric notification type values from the API", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify([
          {
            ...createNotification({ title: "Badge unlocked" }),
            type: 0,
          },
        ]),
        {
          headers: { "Content-Type": "application/json" },
          status: 200,
        },
      ),
    );
    const api = createNotificationApi("/api/notifications");

    const notifications = await api.getMyNotifications("token");

    expect(notifications[0].type).toBe("BadgeUnlocked");
    expect(fetchMock).toHaveBeenCalledWith("/api/notifications/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token",
      },
    });

    fetchMock.mockRestore();
  });
});
