import {
  AlertCircle,
  Award,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  MapPin,
  Route,
  Sparkles,
  Trophy,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import type { BadgeResponse, BadgeType } from "../types/badge";

interface BadgeWallProps {
  badges: BadgeResponse[];
  errorMessage?: string | null;
  isLoading?: boolean;
  onRetry?: () => void;
}

const badgeTypeOrder: BadgeType[] = [
  "Completion",
  "Distance",
  "Region",
  "Difficulty",
  "Streak",
];

const badgeNameOrder: Record<BadgeType, string[]> = {
  Completion: [
    "First Trail",
    "Trail Explorer",
    "Trail Master",
    "Trail Legend",
    "Trail Champion",
  ],
  Distance: [
    "50km Explorer",
    "100km Explorer",
    "250km Explorer",
    "500km Explorer",
    "1000km Explorer",
  ],
  Region: [
    "Port Hills Explorer",
    "Banks Peninsula Explorer",
    "Canterbury Explorer",
  ],
  Difficulty: [
    "Advanced Explorer",
    "Expert Explorer",
    "Expert Specialist",
    "Expert Master",
  ],
  Streak: [
    "2 Week Streak",
    "4 Week Streak",
    "8 Week Streak",
    "12 Week Streak",
    "24 Week Streak",
  ],
};

const badgeTypeClassNames: Record<BadgeType, string> = {
  Completion: "border-emerald-300/30 bg-emerald-400/10 text-emerald-100",
  Distance: "border-amber-300/30 bg-amber-400/10 text-amber-100",
  Region: "border-sky-300/30 bg-sky-400/10 text-sky-100",
  Difficulty: "border-rose-300/30 bg-rose-400/10 text-rose-100",
  Streak: "border-violet-300/30 bg-violet-400/10 text-violet-100",
};

function BadgeTypeIcon({ type }: { type: BadgeType }) {
  if (type === "Completion") {
    return <Trophy aria-hidden="true" className="size-5" />;
  }

  if (type === "Distance") {
    return <Route aria-hidden="true" className="size-5" />;
  }

  if (type === "Region") {
    return <MapPin aria-hidden="true" className="size-5" />;
  }

  if (type === "Difficulty") {
    return <Sparkles aria-hidden="true" className="size-5" />;
  }

  return <Award aria-hidden="true" className="size-5" />;
}

function formatUnlockedDate(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value));
}

function sortBadgesByProgression(badges: BadgeResponse[]) {
  return [...badges].sort((first, second) => {
    const order = badgeNameOrder[first.type];
    const firstIndex = order.indexOf(first.name);
    const secondIndex = order.indexOf(second.name);

    if (firstIndex === -1 || secondIndex === -1) {
      return first.name.localeCompare(second.name);
    }

    return firstIndex - secondIndex;
  });
}

function groupBadgesByType(badges: BadgeResponse[]) {
  return badgeTypeOrder
    .map((type) => ({
      type,
      badges: sortBadgesByProgression(
        badges.filter((badge) => badge.type === type),
      ),
    }))
    .filter((group) => group.badges.length > 0);
}

function BadgeProgressCard({
  badges,
  type,
}: {
  badges: BadgeResponse[];
  type: BadgeType;
}) {
  const unlockedCount = badges.filter((badge) => badge.isUnlocked).length;
  const progressPercent = Math.round((unlockedCount / badges.length) * 100);

  return (
    <Card className="border-white/10 bg-[#071511] text-white shadow-lg shadow-black/15">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex size-12 shrink-0 items-center justify-center rounded-lg border ${badgeTypeClassNames[type]}`}
            >
              <BadgeTypeIcon type={type} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase text-[#C4B5FD]">
                {type}
              </p>
              <h2 className="mt-1 text-xl font-black leading-tight">
                {type} progression
              </h2>
            </div>
          </div>

          <div className="w-fit rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-bold text-white">
            {unlockedCount}/{badges.length}
          </div>
        </div>

        <div className="mt-5">
          <div
            aria-label={`${type} badge progress`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={progressPercent}
            className="h-3 overflow-hidden rounded-full border border-[#8B5CF6]/25 bg-black/30"
            role="progressbar"
          >
            <div
              className="h-full rounded-full bg-[#8B5CF6] transition-[width] duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-semibold text-[#94A3B8]">
            {progressPercent}% complete
          </p>
        </div>

        <ol className="mt-5 grid gap-3" aria-label={`${type} badge tiers`}>
          {badges.map((badge, index) => {
            const unlockedDate = formatUnlockedDate(badge.unlockedAt);
            const tierProgressPercent =
              badge.targetValue > 0
                ? Math.min(
                    100,
                    Math.round((badge.currentValue / badge.targetValue) * 100),
                  )
                : 0;

            return (
              <li
                className={`rounded-lg border p-3 ${
                  badge.isUnlocked
                    ? "border-emerald-300/25 bg-emerald-400/10"
                    : "border-white/10 bg-white/[0.04]"
                }`}
                key={badge.id}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                      badge.isUnlocked
                        ? "bg-emerald-300 text-[#052E1A]"
                        : "bg-white/10 text-white/54"
                    }`}
                  >
                    {badge.isUnlocked ? (
                      <CheckCircle2 aria-hidden="true" className="size-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="font-bold leading-tight">{badge.name}</h3>
                      <span
                        className={`inline-flex w-fit items-center gap-1 rounded-md px-2 py-1 text-xs font-bold ${
                          badge.isUnlocked
                            ? "bg-emerald-300/15 text-emerald-100"
                            : "bg-white/8 text-white/58"
                        }`}
                      >
                        {badge.isUnlocked ? (
                          <CheckCircle2 aria-hidden="true" className="size-3" />
                        ) : (
                          <LockKeyhole aria-hidden="true" className="size-3" />
                        )}
                        {badge.isUnlocked ? "Unlocked" : "Locked"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-5 text-[#CBD5E1]">
                      {badge.description}
                    </p>
                    <div className="mt-3">
                      <div className="flex items-center justify-between gap-3 text-xs font-semibold">
                        <span className="text-[#C4B5FD]">
                          {badge.progressLabel}
                        </span>
                        <span className="text-[#94A3B8]">
                          {tierProgressPercent}%
                        </span>
                      </div>
                      <div
                        aria-label={`${badge.name} progress`}
                        aria-valuemax={100}
                        aria-valuemin={0}
                        aria-valuenow={tierProgressPercent}
                        className="mt-2 h-2 overflow-hidden rounded-full border border-white/10 bg-black/25"
                        role="progressbar"
                      >
                        <div
                          className={`h-full rounded-full transition-[width] duration-500 ${
                            badge.isUnlocked ? "bg-emerald-300" : "bg-[#8B5CF6]"
                          }`}
                          style={{ width: `${tierProgressPercent}%` }}
                        />
                      </div>
                    </div>
                    {unlockedDate ? (
                      <p className="mt-2 text-xs font-semibold text-emerald-100/80">
                        Unlocked {unlockedDate}
                      </p>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

function BadgeWall({
  badges,
  errorMessage = null,
  isLoading = false,
  onRetry,
}: BadgeWallProps) {
  const unlockedCount = badges.filter((badge) => badge.isUnlocked).length;
  const badgeGroups = groupBadgesByType(badges);

  if (isLoading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-white/10 bg-[#071511] text-[#94A3B8]">
        <Loader2 aria-hidden="true" className="mr-2 size-5 animate-spin" />
        Loading badges
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-red-400/25 bg-red-500/10 p-8 text-center">
        <AlertCircle aria-hidden="true" className="size-10 text-red-300" />
        <h2 className="mt-4 text-lg font-bold">Badges unavailable</h2>
        <p className="mt-2 max-w-md text-sm text-red-100/75">
          {errorMessage}
        </p>
        {onRetry ? (
          <Button
            className="mt-5 border-red-200/25 bg-red-100/10 text-red-50 hover:bg-red-100/15"
            type="button"
            variant="outline"
            onClick={onRetry}
          >
            Try again
          </Button>
        ) : null}
      </div>
    );
  }

  if (badges.length === 0) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-white/10 bg-[#071511] p-8 text-center">
        <Award aria-hidden="true" className="size-10 text-[#C4B5FD]" />
        <h2 className="mt-4 text-lg font-bold">No badges available</h2>
        <p className="mt-2 max-w-md text-sm text-[#94A3B8]">
          Badge definitions will appear here when they are available.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-5" aria-label="Badge wall">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-bold uppercase text-white/50">Unlocked</p>
          <p className="mt-1 text-2xl font-black text-white">{unlockedCount}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-bold uppercase text-white/50">Available</p>
          <p className="mt-1 text-2xl font-black text-white">{badges.length}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-bold uppercase text-white/50">Progress</p>
          <p className="mt-1 text-2xl font-black text-[#C4B5FD]">
            {Math.round((unlockedCount / badges.length) * 100)}%
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {badgeGroups.map((group) => (
          <BadgeProgressCard
            badges={group.badges}
            key={group.type}
            type={group.type}
          />
        ))}
      </div>
    </section>
  );
}

export { BadgeWall };
