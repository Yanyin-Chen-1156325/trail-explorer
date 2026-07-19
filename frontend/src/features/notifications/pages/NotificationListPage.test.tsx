import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTestSession, resetAuthStore } from "@/features/auth/testUtils";
import { useNotificationStore } from "@/features/notifications";
import { renderWithRouter } from "@/test/renderWithRouter";

import { createNotification } from "../testUtils";
import { NotificationListPage } from "./NotificationListPage";

function mockJsonResponse(
  body: unknown,
  status: number = 200,
  statusText: string = "OK",
) {
  return new Response(JSON.stringify(body), {
    status,
    statusText,
    headers: {
      "Content-Type": "application/json",
    },
  }) as Response;
}

describe("NotificationListPage", () => {
  beforeEach(() => {
    resetAuthStore({ session: createTestSession() });
    useNotificationStore.getState().reset();
    vi.restoreAllMocks();
  });

  it("renders notifications and unread count", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockJsonResponse([
        createNotification(),
        createNotification({
          id: "notification-2",
          type: "LevelUp",
          title: "Level up",
          message: "You reached level 2.",
          isRead: true,
        }),
      ]),
    );

    renderWithRouter(<NotificationListPage />, {
      initialEntries: ["/notifications"],
    });

    expect(screen.getByText("Loading notifications")).toBeInTheDocument();
    expect(
      await screen.findByText("Achievement notification center"),
    ).toBeInTheDocument();
    expect(screen.getByText("XP gained")).toBeInTheDocument();
    expect(screen.getByText("Level up")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("marks one notification as read", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(mockJsonResponse([createNotification()]))
      .mockResolvedValueOnce(
        mockJsonResponse(createNotification({ isRead: true })),
      );

    renderWithRouter(<NotificationListPage />, {
      initialEntries: ["/notifications"],
    });

    await user.click(await screen.findByRole("button", { name: "Mark read" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/notifications/notification-1/read"),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer access-token",
          },
        },
      );
    });
    expect(
      screen.queryByRole("button", { name: "Mark read" }),
    ).not.toBeInTheDocument();
  });

  it("marks all notifications as read", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        mockJsonResponse([
          createNotification(),
          createNotification({ id: "notification-2" }),
        ]),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    renderWithRouter(<NotificationListPage />, {
      initialEntries: ["/notifications"],
    });

    await user.click(
      await screen.findByRole("button", { name: "Mark all read" }),
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/notifications/read-all"),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer access-token",
          },
        },
      );
    });
    expect(
      screen.queryByRole("button", { name: "Mark read" }),
    ).not.toBeInTheDocument();
  });

  it("renders an empty state", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockJsonResponse([]));

    renderWithRouter(<NotificationListPage />, {
      initialEntries: ["/notifications"],
    });

    expect(await screen.findByText("No notifications yet.")).toBeInTheDocument();
  });
});
