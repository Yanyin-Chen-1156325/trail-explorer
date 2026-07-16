import type { UserProgress } from "@/features/progress";
import type { BadgeType, RawBadgeType } from "@/features/badges";

export interface DashboardUserSummary {
  totalXp: number;
  currentLevel: number;
  completedTrails: number;
  totalDistanceKm: number;
  unlockedBadges: number;
}

export interface DashboardTrailStatistics {
  completedTrails: number;
  uniqueTrailsCompleted: number;
  regionsExplored: number;
}

export interface DashboardDistanceStatistics {
  totalDistanceKm: number;
  averageDistanceKm: number;
  longestTrailDistanceKm: number;
}

export interface DashboardBadge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  type: BadgeType;
  unlockedAt: string;
}

export interface RawDashboardBadge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  type: RawBadgeType;
  unlockedAt: string;
}

export interface DashboardCheckIn {
  id: string;
  trailId: string;
  trailName: string;
  region: string;
  distanceKm: number;
  completedDate: string;
}

export interface DashboardResponse {
  progress: UserProgress;
  userSummary: DashboardUserSummary;
  trailStatistics: DashboardTrailStatistics;
  distanceStatistics: DashboardDistanceStatistics;
  weeklyStreak: number;
  leaderboardRank: number;
  recentBadges: DashboardBadge[];
  recentCheckIns: DashboardCheckIn[];
}

export interface RawDashboardResponse
  extends Omit<DashboardResponse, "recentBadges"> {
  recentBadges: RawDashboardBadge[];
}
