import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTrailResponse, mockJsonResponse } from "../testUtils";

import { createTrailApi, TrailApiError } from "./trailApi";

describe("createTrailApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("builds trail list query parameters and normalizes numeric difficulty", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      await mockJsonResponse({
        items: [
          {
            ...createTrailResponse({ difficulty: "Easy" }),
            difficulty: 2,
          },
        ],
        pageNumber: 2,
        pageSize: 6,
        totalCount: 1,
        totalPages: 1,
      }),
    );
    const api = createTrailApi("/api/trails/");

    const response = await api.getTrails({
      search: "  forest loop  ",
      difficulty: "Hard",
      pageNumber: 2,
      pageSize: 6,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/trails?search=forest+loop&difficulty=Hard&pageNumber=2&pageSize=6",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    expect(response.items[0].difficulty).toBe("Hard");
  });

  it("encodes trail detail ids", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(await mockJsonResponse(createTrailResponse()));
    const api = createTrailApi("/api/trails");

    await api.getTrailById("trail/with spaces");

    expect(fetchMock).toHaveBeenCalledWith("/api/trails/trail%2Fwith%20spaces", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

  it("throws TrailApiError with API message when a request fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      await mockJsonResponse({ message: "Trail not found" }, false, 404),
    );
    const api = createTrailApi("/api/trails");

    await expect(api.getTrailById("missing")).rejects.toEqual(
      new TrailApiError("Trail not found", 404),
    );
  });
});
