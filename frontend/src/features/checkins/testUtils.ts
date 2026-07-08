import type { CheckInResponse } from "./types/checkIn";

function createCheckInResponse(
  overrides: Partial<CheckInResponse> = {},
): CheckInResponse {
  return {
    id: "check-in-1",
    userId: "user-1",
    trailId: "trail-1",
    completedDate: "2026-01-10T00:00:00.000Z",
    notes: "Summit track completed.",
    photoUrl: "https://example.com/photo.jpg",
    isHidden: false,
    ...overrides,
  };
}

export { createCheckInResponse };
