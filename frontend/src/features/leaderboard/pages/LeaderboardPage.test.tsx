import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTestSession, resetAuthStore } from "@/features/auth/testUtils";
import { renderWithRouter } from "@/test/renderWithRouter";

import { LeaderboardPage } from "./LeaderboardPage";

const signalRCallbacks: {
  onBadgeUnlocked?: (badge: unknown) => void;
  onLeaderboardUpdated?: (leaderboard: unknown) => void;
  onRankingUpdated?: (ranking: unknown) => void;
  onXpUpdated?: (xpUpdate: unknown) => void;
} = {};
const startMock = vi.fn();
const stopMock = vi.fn();

vi.mock("../services/leaderboardSignalRClient", () => ({
  createLeaderboardSignalRClient: vi.fn((options) => {
    Object.assign(signalRCallbacks, options);

    return {
      start: startMock,
      stop: stopMock,
    };
  }),
}));

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

const leaderboardPayload = [
  {
    rank: 1,
    userId: "other-user",
    displayName: "Top Hiker",
    totalXp: 500,
    currentLevel: 2,
    completedTrails: 4,
    totalDistanceKm: 40,
    unlockedBadges: 2,
  },
  {
    rank: 2,
    userId: "7b1b74e7-9ad5-4f08-a2ef-086f9a0f4a91",
    displayName: "Alex Walker",
    totalXp: 250,
    currentLevel: 1,
    completedTrails: 2,
    totalDistanceKm: 20,
    unlockedBadges: 1,
  },
];

describe("LeaderboardPage", () => {
  beforeEach(() => {
    resetAuthStore({ session: createTestSession() });
    vi.restoreAllMocks();
    startMock.mockReset().mockResolvedValue(undefined);
    stopMock.mockReset().mockResolvedValue(undefined);
    Object.keys(signalRCallbacks).forEach((key) => {
      delete signalRCallbacks[key as keyof typeof signalRCallbacks];
    });
  });

  it("renders rankings and current user summary", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockJsonResponse(leaderboardPayload),
    );

    renderWithRouter(<LeaderboardPage />, { initialEntries: ["/leaderboard"] });

    expect(screen.getByText("Loading leaderboard")).toBeInTheDocument();
    expect(await screen.findByText("Real-time trail rankings")).toBeInTheDocument();
    expect(screen.getByText("Top Hiker")).toBeInTheDocument();
    expect(screen.getByText("Alex Walker")).toBeInTheDocument();
    expect(screen.getByText("Your rank")).toBeInTheDocument();
    expect(screen.getByText("#2")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Live updates connected")).toBeInTheDocument();
    });
  });

  it("handles live leaderboard and badge updates", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockJsonResponse(leaderboardPayload),
    );

    renderWithRouter(<LeaderboardPage />, { initialEntries: ["/leaderboard"] });

    await screen.findByText("Top Hiker");

    signalRCallbacks.onBadgeUnlocked?.({
      userId: "7b1b74e7-9ad5-4f08-a2ef-086f9a0f4a91",
      badgeId: "badge-1",
      name: "First Trail",
      description: "Complete your first trail.",
      iconUrl: "/badges/first.svg",
      type: "Completion",
      unlockedAt: "2026-07-16T08:00:00.000Z",
    });
    signalRCallbacks.onLeaderboardUpdated?.([
      {
        ...leaderboardPayload[1],
        rank: 1,
        totalXp: 600,
      },
    ]);

    expect(await screen.findByText("Badge unlocked: First Trail")).toBeInTheDocument();
    expect(screen.getByText("Complete your first trail.")).toBeInTheDocument();
    expect(screen.getByText("Leaderboard updated")).toBeInTheDocument();
  });

  it("renders an error state and can retry loading", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        mockJsonResponse({ message: "Leaderboard failed" }, 500, "Server Error"),
      )
      .mockResolvedValueOnce(mockJsonResponse(leaderboardPayload));

    renderWithRouter(<LeaderboardPage />, { initialEntries: ["/leaderboard"] });

    expect(await screen.findByText("Leaderboard unavailable")).toBeInTheDocument();
    expect(screen.getByText("Leaderboard failed")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
    expect(await screen.findByText("Top Hiker")).toBeInTheDocument();
  });
});
