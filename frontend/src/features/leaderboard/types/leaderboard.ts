import type { BadgeType, RawBadgeType } from "@/features/badges";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  totalXp: number;
  currentLevel: number;
  completedTrails: number;
  totalDistanceKm: number;
  unlockedBadges: number;
}

export interface LeaderboardXpUpdate {
  userId: string;
  totalXp: number;
  currentLevel: number;
  rank: number;
}

export interface LeaderboardRankingUpdate {
  userId: string;
  rank: number;
}

export interface LeaderboardBadgeUnlock {
  userId: string;
  badgeId: string;
  name: string;
  description: string;
  iconUrl: string;
  type: BadgeType;
  unlockedAt: string;
}

export interface RawLeaderboardBadgeUnlock
  extends Omit<LeaderboardBadgeUnlock, "type"> {
  type: RawBadgeType;
}
