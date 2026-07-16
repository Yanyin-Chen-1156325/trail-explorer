import type {
  BadgeResponse,
  BadgeType,
  RawBadgeResponse,
  RawBadgeType,
} from "../types/badge";

export class BadgeApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "BadgeApiError";
    this.status = status;
  }
}

export interface BadgeApi {
  getMyBadges(accessToken: string): Promise<BadgeResponse[]>;
}

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");
const badgeTypeLabels: BadgeType[] = [
  "Completion",
  "Distance",
  "Region",
  "Difficulty",
  "Streak",
];

function normalizeBadgeType(value: RawBadgeType): BadgeType {
  if (typeof value === "string") {
    return value;
  }

  return badgeTypeLabels[value] ?? badgeTypeLabels[0];
}

function normalizeBadge(badge: RawBadgeResponse): BadgeResponse {
  return {
    ...badge,
    type: normalizeBadgeType(badge.type),
  };
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { message?: string } | null;
    if (payload?.message) {
      return payload.message;
    }
  } catch {
    // Fall back to the HTTP status text below.
  }

  return response.statusText || "Request failed";
}

async function requestJson<TResponse>(
  url: string,
  accessToken: string,
): Promise<TResponse> {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new BadgeApiError(await readErrorMessage(response), response.status);
  }

  return (await response.json()) as TResponse;
}

export function createBadgeApi(baseUrl: string = "/api/badges"): BadgeApi {
  const normalizedBaseUrl = trimTrailingSlash(baseUrl);

  return {
    async getMyBadges(accessToken) {
      const badges = await requestJson<RawBadgeResponse[]>(
        `${normalizedBaseUrl}/me`,
        accessToken,
      );

      return badges.map(normalizeBadge);
    },
  };
}
