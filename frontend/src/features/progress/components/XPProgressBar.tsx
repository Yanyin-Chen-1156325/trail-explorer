import { Trophy } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import type { UserProgress } from "../types/userProgress";

interface XPProgressBarProps {
  progress: UserProgress;
}

function clampProgressPercent(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, value));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(value);
}

function XPProgressBar({ progress }: XPProgressBarProps) {
  const progressPercent = clampProgressPercent(progress.progressPercent);
  const hasNextLevel =
    typeof progress.nextLevel === "number" &&
    typeof progress.nextLevelMinimumXp === "number";
  const progressLabel = hasNextLevel
    ? `${formatNumber(progress.xpIntoCurrentLevel)} / ${formatNumber(
        progress.xpRequiredForNextLevel,
      )} XP`
    : "Max level reached";
  const remainingXp = Math.max(
    0,
    progress.xpRequiredForNextLevel - progress.xpIntoCurrentLevel,
  );
  const progressSummary = hasNextLevel
    ? `${formatNumber(remainingXp)} XP to Level ${progress.nextLevel}`
    : "All level rewards completed";

  return (
    <Card className="border-white/10 bg-[#071511] text-white shadow-xl shadow-black/20">
      <CardContent className="p-5">
        <div className="grid gap-5 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center">
          <div className="flex items-center gap-4 rounded-xl border border-[#F59E0B]/25 bg-[#F59E0B]/10 p-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-[#F59E0B]/20 text-[#FCD34D]">
              <Trophy aria-hidden="true" className="size-7" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase text-[#FCD34D]">
                Current Level
              </p>
              <p className="mt-1 text-4xl font-black leading-none text-white">
                {progress.currentLevel}
              </p>
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase text-[#FCD34D]">
                  XP Progress
                </p>
                <h2 className="mt-1 text-xl font-black">
                  Trail experience earned
                </h2>
              </div>
              <div className="w-fit rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-sm font-bold text-white">
                {formatNumber(progress.totalXp)} XP
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-[#F59E0B]/20 bg-[#F59E0B]/8 p-4">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-[#FCD34D]">
                Current level progress
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                {progressSummary}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-2xl font-black leading-none text-[#FCD34D]">
                {formatNumber(progressPercent)}%
              </p>
              <p className="mt-1 text-xs font-semibold text-[#94A3B8]">
                {progressLabel}
              </p>
            </div>
          </div>
          <div
            aria-label={`Level ${progress.currentLevel} XP progress`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={progressPercent}
            className="h-4 overflow-hidden rounded-full border border-[#F59E0B]/25 bg-black/30"
            role="progressbar"
          >
            <div
              className="h-full rounded-full bg-[#F59E0B] transition-[width] duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-[#94A3B8]">
            <span>{formatNumber(progress.currentLevelMinimumXp)} XP</span>
            <span>
              {hasNextLevel
                ? `${formatNumber(progress.nextLevelMinimumXp ?? 0)} XP`
                : `${formatNumber(progress.totalXp)} XP`}
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 text-sm text-[#94A3B8] sm:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-white/4 p-3">
            <p className="text-xs uppercase text-white/50">Level floor</p>
            <p className="mt-1 font-bold text-white">
              {formatNumber(progress.currentLevelMinimumXp)} XP
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/4 p-3">
            <p className="text-xs uppercase text-white/50">Next level</p>
            <p className="mt-1 font-bold text-white">
              {hasNextLevel
                ? `Level ${progress.nextLevel} at ${formatNumber(
                    progress.nextLevelMinimumXp ?? 0,
                  )} XP`
                : "Completed"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { XPProgressBar };
