export type TrailDifficulty = "Easy" | "Moderate" | "Hard";

export type RawTrailDifficulty = TrailDifficulty | number;

export interface TrailResponse {
  id: string;
  docId: string;
  name: string;
  city: string;
  region: string;
  difficulty: TrailDifficulty;
  distanceKm: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface RawTrailResponse {
  id: string;
  docId: string;
  name: string;
  city: string;
  region: string;
  difficulty: RawTrailDifficulty;
  distanceKm: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrailQueryRequest {
  search?: string;
  difficulty?: TrailDifficulty;
  pageNumber?: number;
  pageSize?: number;
}

export interface PagedTrailResponse {
  items: TrailResponse[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface RawPagedTrailResponse {
  items: RawTrailResponse[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
