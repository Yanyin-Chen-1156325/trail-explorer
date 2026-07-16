import { beforeEach, describe, expect, it, vi } from "vitest";

import { createLeaderboardApi, LeaderboardApiError } from "./leaderboardApi";

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

describe("createLeaderboardApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("gets leaderboard entries with bearer token authorization", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockJsonResponse([
        {
          rank: 1,
          userId: "user-1",
          displayName: "Trail User",
          totalXp: 250,
          currentLevel: 1,
          completedTrails: 2,
          totalDistanceKm: 20,
          unlockedBadges: 1,
        },
      ]),
    );
    const api = createLeaderboardApi("/api/leaderboard/");

    const leaderboard = await api.getLeaderboard("access-token", 25);

    expect(fetchMock).toHaveBeenCalledWith("/api/leaderboard?limit=25", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer access-token",
      },
    });
    expect(leaderboard[0].rank).toBe(1);
  });

  it("throws LeaderboardApiError with API message when a request fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockJsonResponse({ message: "Invalid user token" }, 401, "Unauthorized"),
    );
    const api = createLeaderboardApi("/api/leaderboard");

    await expect(api.getLeaderboard("expired-token")).rejects.toEqual(
      new LeaderboardApiError("Invalid user token", 401),
    );
  });
});
