import type { BadgeResponse, BadgeType } from "./types/badge";

function createBadgeResponse(
  overrides: Partial<BadgeResponse> = {},
): BadgeResponse {
  return {
    id: "badge-1",
    name: "First Trail",
    description: "Complete your first trail.",
    iconUrl: "/badges/first-trail.svg",
    type: "Completion",
    isUnlocked: true,
    unlockedAt: "2026-01-12T08:00:00.000Z",
    currentValue: 1,
    targetValue: 1,
    progressLabel: "1/1 trails",
    ...overrides,
  };
}

function createBadgeWithType(type: BadgeType): BadgeResponse {
  return createBadgeResponse({
    id: `badge-${type}`,
    name: `${type} Badge`,
    type,
  });
}

export { createBadgeResponse, createBadgeWithType };
