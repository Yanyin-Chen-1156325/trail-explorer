import { beforeEach, describe, expect, it, vi } from "vitest";

import { createProgressApi, ProgressApiError } from "./progressApi";

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

describe("createProgressApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("gets current user progress with bearer token authorization", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockJsonResponse({
        totalXp: 750,
        currentLevel: 2,
        currentLevelMinimumXp: 500,
        nextLevel: 3,
        nextLevelMinimumXp: 1000,
        xpIntoCurrentLevel: 250,
        xpRequiredForNextLevel: 500,
        progressPercent: 50,
      }),
    );
    const api = createProgressApi("/api/progress/");

    const progress = await api.getMyProgress("access-token");

    expect(fetchMock).toHaveBeenCalledWith("/api/progress/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer access-token",
      },
    });
    expect(progress.currentLevel).toBe(2);
    expect(progress.totalXp).toBe(750);
  });

  it("throws ProgressApiError with API message when a request fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockJsonResponse({ message: "Invalid user token" }, 401, "Unauthorized"),
    );
    const api = createProgressApi("/api/progress");

    await expect(api.getMyProgress("expired-token")).rejects.toEqual(
      new ProgressApiError("Invalid user token", 401),
    );
  });
});
