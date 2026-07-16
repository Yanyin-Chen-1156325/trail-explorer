import { beforeEach, describe, expect, it, vi } from "vitest";

import { createDashboardApi, DashboardApiError } from "./dashboardApi";

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
      type: 0,
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

describe("createDashboardApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("gets the current user dashboard with bearer token authorization", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(mockJsonResponse(dashboardPayload));
    const api = createDashboardApi("/api/dashboard/");

    const dashboard = await api.getMyDashboard("access-token");

    expect(fetchMock).toHaveBeenCalledWith("/api/dashboard/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer access-token",
      },
    });
    expect(dashboard.userSummary.completedTrails).toBe(5);
    expect(dashboard.recentBadges[0].type).toBe("Completion");
  });

  it("throws DashboardApiError with API message when a request fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockJsonResponse({ message: "Invalid user token" }, 401, "Unauthorized"),
    );
    const api = createDashboardApi("/api/dashboard");

    await expect(api.getMyDashboard("expired-token")).rejects.toEqual(
      new DashboardApiError("Invalid user token", 401),
    );
  });
});
