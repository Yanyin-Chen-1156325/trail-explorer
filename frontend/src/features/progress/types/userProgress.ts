export interface UserProgress {
  totalXp: number;
  currentLevel: number;
  currentLevelMinimumXp: number;
  nextLevel?: number | null;
  nextLevelMinimumXp?: number | null;
  xpIntoCurrentLevel: number;
  xpRequiredForNextLevel: number;
  progressPercent: number;
}
