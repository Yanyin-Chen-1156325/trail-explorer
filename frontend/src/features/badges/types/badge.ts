export type BadgeType =
  | "Completion"
  | "Distance"
  | "Region"
  | "Difficulty"
  | "Streak";

export type RawBadgeType = BadgeType | number;

export interface BadgeResponse {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  type: BadgeType;
  isUnlocked: boolean;
  unlockedAt: string | null;
  currentValue: number;
  targetValue: number;
  progressLabel: string;
}

export interface RawBadgeResponse {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  type: RawBadgeType;
  isUnlocked: boolean;
  unlockedAt: string | null;
  currentValue: number;
  targetValue: number;
  progressLabel: string;
}
