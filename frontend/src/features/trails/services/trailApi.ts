import type {
  PagedTrailResponse,
  RawPagedTrailResponse,
  RawTrailDifficulty,
  RawTrailResponse,
  TrailDifficulty,
  TrailQueryRequest,
  TrailResponse,
} from "../types/trail";

export class TrailApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "TrailApiError";
    this.status = status;
  }
}

export interface TrailApi {
  getTrails(query?: TrailQueryRequest): Promise<PagedTrailResponse>;
  getTrailById(id: string): Promise<TrailResponse>;
}

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const trailDifficultyLabels: TrailDifficulty[] = [
  "Easy",
  "Intermediate",
  "Advanced",
  "Expert",
];

function normalizeDifficulty(value: RawTrailDifficulty): TrailDifficulty {
  if (typeof value === "string") {
    return value;
  }

  return trailDifficultyLabels[value] ?? trailDifficultyLabels[0];
}

function normalizeTrail(trail: RawTrailResponse): TrailResponse {
  return {
    ...trail,
    difficulty: normalizeDifficulty(trail.difficulty),
  };
}

function normalizePagedTrailResponse(
  response: RawPagedTrailResponse,
): PagedTrailResponse {
  return {
    ...response,
    items: response.items.map(normalizeTrail),
  };
}

function buildTrailQueryString(query?: TrailQueryRequest): string {
  if (!query) {
    return "";
  }

  const params = new URLSearchParams();
  const search = query.search?.trim();

  if (search) {
    params.set("search", search);
  }

  if (query.difficulty) {
    params.set("difficulty", query.difficulty);
  }

  if (query.pageNumber !== undefined) {
    params.set("pageNumber", query.pageNumber.toString());
  }

  if (query.pageSize !== undefined) {
    params.set("pageSize", query.pageSize.toString());
  }

  const queryString = params.toString();

  return queryString ? `?${queryString}` : "";
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
  baseUrl: string,
  path: string,
): Promise<TResponse> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new TrailApiError(await readErrorMessage(response), response.status);
  }

  return (await response.json()) as TResponse;
}

export function createTrailApi(baseUrl: string = "/api/trails"): TrailApi {
  const normalizedBaseUrl = trimTrailingSlash(baseUrl);

  return {
    async getTrails(query) {
      const trails = await requestJson<RawPagedTrailResponse>(
        normalizedBaseUrl,
        buildTrailQueryString(query),
      );

      return normalizePagedTrailResponse(trails);
    },
    async getTrailById(id) {
      const trail = await requestJson<RawTrailResponse>(
        normalizedBaseUrl,
        `/${encodeURIComponent(id)}`,
      );

      return normalizeTrail(trail);
    },
  };
}
