import type { UserProgress } from "../types/userProgress";

export class ProgressApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ProgressApiError";
    this.status = status;
  }
}

export interface ProgressApi {
  getMyProgress(accessToken: string): Promise<UserProgress>;
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
    throw new ProgressApiError(await readErrorMessage(response), response.status);
  }

  return (await response.json()) as TResponse;
}

export function createProgressApi(
  baseUrl: string = "/api/progress",
): ProgressApi {
  const normalizedBaseUrl = trimTrailingSlash(baseUrl);

  return {
    async getMyProgress(accessToken) {
      return await requestJson<UserProgress>(
        `${normalizedBaseUrl}/me`,
        accessToken,
      );
    },
  };
}
