import type { LeaderboardEntry } from "../types/leaderboard";

export class LeaderboardApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "LeaderboardApiError";
    this.status = status;
  }
}

export interface LeaderboardApi {
  getLeaderboard(accessToken: string, limit?: number): Promise<LeaderboardEntry[]>;
}

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

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
    throw new LeaderboardApiError(
      await readErrorMessage(response),
      response.status,
    );
  }

  return (await response.json()) as TResponse;
}

export function createLeaderboardApi(
  baseUrl: string = "/api/leaderboard",
): LeaderboardApi {
  const normalizedBaseUrl = trimTrailingSlash(baseUrl);

  return {
    async getLeaderboard(accessToken, limit = 50) {
      const params = new URLSearchParams();
      params.set("limit", String(limit));

      return await requestJson<LeaderboardEntry[]>(
        `${normalizedBaseUrl}?${params.toString()}`,
        accessToken,
      );
    },
  };
}
