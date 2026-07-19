import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTestSession, resetAuthStore } from "@/features/auth/testUtils";
import { ToastProvider } from "@/shared/components/ToastProvider";
import { renderWithRouter } from "@/test/renderWithRouter";

import { DashboardPage } from "./DashboardPage";

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

const dashboardPayload = {
  progress: {
    totalXp: 750,
    currentLevel: 2,
    currentLevelMinimumXp: 500,
    nextLevel: 3,
    nextLevelMinimumXp: 1000,
    xpIntoCurrentLevel: 250,
    xpRequiredForNextLevel: 500,
    progressPercent: 50,
  },
  userSummary: {
    totalXp: 750,
    currentLevel: 2,
    completedTrails: 5,
    totalDistanceKm: 42.5,
    unlockedBadges: 3,
  },
  trailStatistics: {
    completedTrails: 5,
    uniqueTrailsCompleted: 4,
    regionsExplored: 2,
  },
  distanceStatistics: {
    totalDistanceKm: 42.5,
    averageDistanceKm: 8.5,
    longestTrailDistanceKm: 14,
  },
  weeklyStreak: 3,
  leaderboardRank: 7,
  recentBadges: [
    {
      id: "badge-1",
      name: "First Trail",
      description: "Complete your first trail.",
      iconUrl: "/badges/first.svg",
      type: "Completion",
      unlockedAt: "2026-07-15T09:00:00.000Z",
    },
  ],
  recentCheckIns: [
    {
      id: "checkin-1",
      trailId: "trail-1",
      trailName: "Port Hills Loop",
      region: "Port Hills",
      distanceKm: 8.5,
      completedDate: "2026-07-15T08:00:00.000Z",
    },
  ],
};

describe("DashboardPage", () => {
  beforeEach(() => {
    resetAuthStore({ session: createTestSession() });
    vi.restoreAllMocks();
  });

  it("renders progress, statistics, achievements, and recent check-ins", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockJsonResponse(dashboardPayload),
    );

    renderWithRouter(<DashboardPage />, { initialEntries: ["/dashboard"] });

    expect(screen.getByText("Loading dashboard")).toBeInTheDocument();
    expect(await screen.findByText("Trail progress overview")).toBeInTheDocument();
    expect(screen.getByText("750 XP")).toBeInTheDocument();
    expect(screen.getByText("Completed trails")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("42.5 km")).toBeInTheDocument();
    expect(screen.getByText("3 wk")).toBeInTheDocument();
    expect(screen.getByText("#7")).toBeInTheDocument();
    expect(screen.getByText("3 badges unlocked")).toBeInTheDocument();
    expect(screen.getByText("First Trail")).toBeInTheDocument();
    expect(screen.getByText("Port Hills Loop")).toBeInTheDocument();
  });

  it("renders admin workspace summary and sync action for admin users", async () => {
    const user = userEvent.setup();
    resetAuthStore({ session: createTestSession({ role: "Admin" }) });
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(mockJsonResponse(dashboardPayload))
      .mockResolvedValueOnce(
        mockJsonResponse([
          {
            id: "user-1",
            email: "admin@example.com",
            displayName: "Admin",
            role: "Admin",
            status: "Active",
            authProvider: "Local",
            createdAt: "2026-07-19T00:00:00.000Z",
          },
          {
            id: "user-2",
            email: "moderator@example.com",
            displayName: "Moderator",
            role: "Moderator",
            status: "Suspended",
            authProvider: "Local",
            createdAt: "2026-07-19T00:00:00.000Z",
          },
        ]),
      )
      .mockResolvedValueOnce(
        mockJsonResponse([
          {
            id: "checkin-1",
            userId: "user-1",
            trailId: "trail-1",
            completedDate: "2026-07-19T00:00:00.000Z",
            notes: null,
            photoUrl: null,
            isHidden: false,
          },
          {
            id: "checkin-2",
            userId: "user-2",
            trailId: "trail-2",
            completedDate: "2026-07-19T00:00:00.000Z",
            notes: null,
            photoUrl: null,
            isHidden: true,
          },
        ]),
      )
      .mockResolvedValueOnce(
        mockJsonResponse({
          succeeded: true,
          candidatesFound: 4,
          created: 2,
          updated: 1,
          skipped: 1,
        }),
      );

    renderWithRouter(
      <>
        <ToastProvider />
        <DashboardPage />
      </>,
      { initialEntries: ["/dashboard"] },
    );

    expect(await screen.findByText("Admin workspace")).toBeInTheDocument();
    expect(screen.getByText("System overview")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Moderation" })).toHaveAttribute(
      "href",
      "/moderation/checkins",
    );
    expect(screen.getByRole("link", { name: "Manage Users" })).toHaveAttribute(
      "href",
      "/admin/users",
    );
    expect(screen.getByText("1 active accounts")).toBeInTheDocument();
    expect(screen.getByText("1 moderators")).toBeInTheDocument();
    expect(screen.getByText("1 visible")).toBeInTheDocument();
    expect(screen.getByText("1 suspended users")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Sync DOC trails" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/admin/trails/sync"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer access-token",
          },
        },
      );
    });
    expect(await screen.findByText("DOC sync completed")).toBeInTheDocument();
    expect(screen.getByText("2 created, 1 updated, 1 skipped.")).toBeInTheDocument();
  });

  it("does not render the DOC sync action for moderators", async () => {
    resetAuthStore({ session: createTestSession({ role: "Moderator" }) });
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(mockJsonResponse(dashboardPayload))
      .mockResolvedValueOnce(mockJsonResponse([]))
      .mockResolvedValueOnce(mockJsonResponse([]));

    renderWithRouter(<DashboardPage />, { initialEntries: ["/dashboard"] });

    expect(await screen.findByText("Moderator workspace")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Sync DOC trails" }),
    ).not.toBeInTheDocument();
  });

  it("renders empty dashboard widgets when no activity exists", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockJsonResponse({
        ...dashboardPayload,
        userSummary: {
          totalXp: 0,
          currentLevel: 1,
          completedTrails: 0,
          totalDistanceKm: 0,
          unlockedBadges: 0,
        },
        trailStatistics: {
          completedTrails: 0,
          uniqueTrailsCompleted: 0,
          regionsExplored: 0,
        },
        distanceStatistics: {
          totalDistanceKm: 0,
          averageDistanceKm: 0,
          longestTrailDistanceKm: 0,
        },
        weeklyStreak: 0,
        leaderboardRank: 1,
        recentBadges: [],
        recentCheckIns: [],
      }),
    );

    renderWithRouter(<DashboardPage />, { initialEntries: ["/dashboard"] });

    expect(await screen.findByText("No badges unlocked yet.")).toBeInTheDocument();
    expect(screen.getByText("No check-ins yet.")).toBeInTheDocument();
  });

  it("renders an error state and can retry loading", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        mockJsonResponse({ message: "Dashboard failed" }, 500, "Server Error"),
      )
      .mockResolvedValueOnce(mockJsonResponse(dashboardPayload));

    renderWithRouter(<DashboardPage />, { initialEntries: ["/dashboard"] });

    expect(await screen.findByText("Dashboard unavailable")).toBeInTheDocument();
    expect(screen.getByText("Dashboard failed")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
    expect(await screen.findByText("Port Hills Loop")).toBeInTheDocument();
  });

  it("shows a session error when no user is signed in", async () => {
    resetAuthStore({ session: null });

    renderWithRouter(<DashboardPage />, { initialEntries: ["/dashboard"] });

    expect(
      await screen.findByText("Sign in again to view your dashboard."),
    ).toBeInTheDocument();
  });
});
