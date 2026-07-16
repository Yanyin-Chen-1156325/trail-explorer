import { beforeEach, describe, expect, it, vi } from "vitest";

import { createLeaderboardSignalRClient } from "./leaderboardSignalRClient";

const callbacks = new Map<string, (payload: unknown) => void>();
const startMock = vi.fn();
const stopMock = vi.fn();
const withUrlMock = vi.fn();

vi.mock("@microsoft/signalr", () => {
  class HubConnectionBuilder {
    withUrl(...args: unknown[]) {
      withUrlMock(...args);
      return this;
    }

    withAutomaticReconnect() {
      return this;
    }

    configureLogging() {
      return this;
    }

    build() {
      return {
        on: (eventName: string, callback: (payload: unknown) => void) => {
          callbacks.set(eventName, callback);
        },
        start: startMock,
        state: "Disconnected",
        stop: stopMock,
      };
    }
  }

  return {
    HubConnectionBuilder,
    HubConnectionState: {
      Disconnected: "Disconnected",
    },
    LogLevel: {
      Warning: 2,
    },
  };
});

describe("createLeaderboardSignalRClient", () => {
  beforeEach(() => {
    callbacks.clear();
    startMock.mockReset().mockResolvedValue(undefined);
    stopMock.mockReset().mockResolvedValue(undefined);
    withUrlMock.mockReset();
  });

  it("connects to the leaderboard hub with access token factory", async () => {
    const client = createLeaderboardSignalRClient({
      accessToken: "access-token",
      hubUrl: "/hubs/leaderboard",
    });

    await client.start();

    expect(withUrlMock).toHaveBeenCalledWith(
      "/hubs/leaderboard",
      expect.objectContaining({
        accessTokenFactory: expect.any(Function),
      }),
    );
    const [, options] = withUrlMock.mock.calls[0];
    expect(options.accessTokenFactory()).toBe("access-token");
    expect(startMock).toHaveBeenCalledTimes(1);
  });

  it("normalizes badge unlock payloads", () => {
    const onBadgeUnlocked = vi.fn();
    createLeaderboardSignalRClient({
      accessToken: "access-token",
      hubUrl: "/hubs/leaderboard",
      onBadgeUnlocked,
    });

    callbacks.get("BadgeUnlocked")?.({
      userId: "user-1",
      badgeId: "badge-1",
      name: "First Trail",
      description: "Complete your first trail.",
      iconUrl: "/badges/first.svg",
      type: 0,
      unlockedAt: "2026-07-16T08:00:00.000Z",
    });

    expect(onBadgeUnlocked).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "First Trail",
        type: "Completion",
      }),
    );
  });
});
