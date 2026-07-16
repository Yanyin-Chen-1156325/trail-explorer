import type {
  DashboardResponse,
  RawDashboardResponse,
} from "../types/dashboard";
import type { BadgeType, RawBadgeType } from "@/features/badges";

export class DashboardApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "DashboardApiError";
    this.status = status;
  }
}

export interface DashboardApi {
  getMyDashboard(accessToken: string): Promise<DashboardResponse>;
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

function normalizeDashboard(
  dashboard: RawDashboardResponse,
): DashboardResponse {
  return {
    ...dashboard,
    recentBadges: dashboard.recentBadges.map((badge) => ({
      ...badge,
      type: normalizeBadgeType(badge.type),
    })),
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
    throw new DashboardApiError(
      await readErrorMessage(response),
      response.status,
    );
  }

  return (await response.json()) as TResponse;
}

export function createDashboardApi(
  baseUrl: string = "/api/dashboard",
): DashboardApi {
  const normalizedBaseUrl = trimTrailingSlash(baseUrl);

  return {
    async getMyDashboard(accessToken) {
      const dashboard = await requestJson<RawDashboardResponse>(
        `${normalizedBaseUrl}/me`,
        accessToken,
      );

      return normalizeDashboard(dashboard);
    },
  };
}
