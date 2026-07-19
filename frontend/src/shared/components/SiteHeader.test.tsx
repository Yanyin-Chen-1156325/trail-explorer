import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTestSession, resetAuthStore } from "@/features/auth/testUtils";
import { useNotificationStore } from "@/features/notifications";
import { createNotification } from "@/features/notifications/testUtils";
import { renderWithRouter } from "@/test/renderWithRouter";

import { SiteHeader } from "./SiteHeader";

describe("SiteHeader", () => {
  beforeEach(() => {
    resetAuthStore({ session: createTestSession() });
    useNotificationStore.getState().reset();
    vi.restoreAllMocks();
  });

  it("opens a notification dropdown from the bell indicator", async () => {
    const user = userEvent.setup();
    useNotificationStore.setState({
      notifications: [
        createNotification({
          title: "Badge unlocked",
          message: "You unlocked First Trail.",
        }),
      ],
      unreadCount: 1,
    });

    renderWithRouter(<SiteHeader />, { initialEntries: ["/dashboard"] });

    await user.click(
      screen.getAllByRole("button", { name: "1 unread notifications" })[0],
    );

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByText("Badge unlocked")).toBeInTheDocument();
    expect(screen.getByText("You unlocked First Trail.")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View all notifications" }),
    ).toHaveAttribute("href", "/notifications");
  });

  it("shows trail activity and workspace navigation for admins and moderators", () => {
    resetAuthStore({ session: createTestSession({ role: "Admin" }) });

    renderWithRouter(<SiteHeader />, { initialEntries: ["/dashboard"] });

    const primaryNavigation = screen.getByRole("navigation", {
      name: "Primary",
    });

    expect(primaryNavigation).toHaveTextContent("Dashboard");
    expect(primaryNavigation).toHaveTextContent("Trails");
    expect(primaryNavigation).toHaveTextContent("Check-ins");
    expect(primaryNavigation).toHaveTextContent("Badges");
    expect(primaryNavigation).toHaveTextContent("Leaderboard");
    expect(primaryNavigation).toHaveTextContent("Notifications");
    expect(primaryNavigation).toHaveTextContent("Moderation");
    expect(primaryNavigation).toHaveTextContent("Manage Users");
  });
});
