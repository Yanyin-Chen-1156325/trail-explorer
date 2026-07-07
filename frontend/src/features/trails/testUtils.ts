import type { TrailDifficulty, TrailResponse } from "./types/trail";

function createTrailResponse(
  overrides: Partial<TrailResponse> = {},
): TrailResponse {
  return {
    id: "trail-1",
    docId: "doc-trail-1",
    name: "Forest Loop",
    city: "Wellington",
    region: "Canterbury",
    difficulty: "Easy",
    distanceKm: 8.5,
    description: "A sheltered forest walk with river views.",
    latitude: -43.781,
    longitude: 172.664,
    createdAt: "2026-01-10T00:00:00.000Z",
    updatedAt: "2026-02-10T00:00:00.000Z",
    ...overrides,
  };
}

function createTrailsResponse(
  trails: TrailResponse[] = [createTrailResponse()],
) {
  return {
    items: trails,
    pageNumber: 1,
    pageSize: 12,
    totalCount: trails.length,
    totalPages: trails.length > 0 ? 1 : 0,
  };
}

function mockJsonResponse(body: unknown, ok = true, status = 200) {
  return Promise.resolve({
    ok,
    status,
    statusText: ok ? "OK" : "Request failed",
    json: () => Promise.resolve(body),
  } as Response);
}

function createTrailWithDifficulty(difficulty: TrailDifficulty) {
  return createTrailResponse({
    id: `trail-${difficulty.toLowerCase()}`,
    docId: `doc-${difficulty.toLowerCase()}`,
    name: `${difficulty} Trail`,
    difficulty,
  });
}

export {
  createTrailResponse,
  createTrailsResponse,
  createTrailWithDifficulty,
  mockJsonResponse,
};
