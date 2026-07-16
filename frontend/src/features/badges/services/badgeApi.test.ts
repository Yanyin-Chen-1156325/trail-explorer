import { describe, expect, it, vi } from "vitest";

import { createBadgeResponse } from "../testUtils";
import { createBadgeApi } from "./badgeApi";

describe("badgeApi", () => {
  it("normalizes numeric badge type values from the API", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              ...createBadgeResponse({ name: "50km Explorer" }),
              type: 1,
            },
          ]),
          {
            headers: { "Content-Type": "application/json" },
            status: 200,
          },
        ),
      );

    const api = createBadgeApi("/api/badges");

    const badges = await api.getMyBadges("token");

    expect(badges[0].type).toBe("Distance");
    expect(fetchMock).toHaveBeenCalledWith("/api/badges/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token",
      },
    });

    fetchMock.mockRestore();
  });
});
