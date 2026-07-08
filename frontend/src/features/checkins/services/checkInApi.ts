import type {
  CheckInResponse,
  CreateCheckInRequest,
  UpdateCheckInRequest,
} from "../types/checkIn";

export class CheckInApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "CheckInApiError";
    this.status = status;
  }
}

export interface CheckInApi {
  createCheckIn(
    accessToken: string,
    request: CreateCheckInRequest,
  ): Promise<CheckInResponse>;
  getAllCheckIns(accessToken: string): Promise<CheckInResponse[]>;
  getMyCheckInHistory(accessToken: string): Promise<CheckInResponse[]>;
  updateCheckIn(
    accessToken: string,
    checkInId: string,
    request: UpdateCheckInRequest,
  ): Promise<CheckInResponse>;
  deleteCheckIn(accessToken: string, checkInId: string): Promise<void>;
  hideCheckIn(accessToken: string, checkInId: string): Promise<CheckInResponse>;
  restoreCheckIn(
    accessToken: string,
    checkInId: string,
  ): Promise<CheckInResponse>;
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
  init: RequestInit,
): Promise<TResponse> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...init.headers,
    },
    ...init,
  });

  if (!response.ok) {
    throw new CheckInApiError(await readErrorMessage(response), response.status);
  }

  return (await response.json()) as TResponse;
}

async function requestNoContent(
  url: string,
  accessToken: string,
  init: RequestInit,
): Promise<void> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...init.headers,
    },
    ...init,
  });

  if (!response.ok) {
    throw new CheckInApiError(await readErrorMessage(response), response.status);
  }
}

export function createCheckInApi(baseUrl: string = "/api/checkins"): CheckInApi {
  const normalizedBaseUrl = trimTrailingSlash(baseUrl);

  return {
    async createCheckIn(accessToken, request) {
      return await requestJson<CheckInResponse>(normalizedBaseUrl, accessToken, {
        method: "POST",
        body: JSON.stringify(request),
      });
    },
    async getAllCheckIns(accessToken) {
      return await requestJson<CheckInResponse[]>(
        normalizedBaseUrl,
        accessToken,
        {
          method: "GET",
        },
      );
    },
    async getMyCheckInHistory(accessToken) {
      return await requestJson<CheckInResponse[]>(
        `${normalizedBaseUrl}/me`,
        accessToken,
        {
          method: "GET",
        },
      );
    },
    async updateCheckIn(accessToken, checkInId, request) {
      return await requestJson<CheckInResponse>(
        `${normalizedBaseUrl}/${encodeURIComponent(checkInId)}`,
        accessToken,
        {
          method: "PUT",
          body: JSON.stringify(request),
        },
      );
    },
    async deleteCheckIn(accessToken, checkInId) {
      await requestNoContent(
        `${normalizedBaseUrl}/${encodeURIComponent(checkInId)}`,
        accessToken,
        {
          method: "DELETE",
        },
      );
    },
    async hideCheckIn(accessToken, checkInId) {
      return await requestJson<CheckInResponse>(
        `${normalizedBaseUrl}/${encodeURIComponent(checkInId)}/hide`,
        accessToken,
        {
          method: "PUT",
        },
      );
    },
    async restoreCheckIn(accessToken, checkInId) {
      return await requestJson<CheckInResponse>(
        `${normalizedBaseUrl}/${encodeURIComponent(checkInId)}/restore`,
        accessToken,
        {
          method: "PUT",
        },
      );
    },
  };
}
