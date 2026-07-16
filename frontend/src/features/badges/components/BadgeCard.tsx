import { Award, CheckCircle2, LockKeyhole, MapPin, Route, Sparkles, Trophy } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import type { BadgeResponse, BadgeType } from "../types/badge";

interface BadgeCardProps {
  badge: BadgeResponse;
}

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
    return "Locked";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value));
}

function BadgeCard({ badge }: BadgeCardProps) {
  return (
    <Card
      className={`border-white/10 bg-[#071511] text-white shadow-lg shadow-black/15 transition ${
        badge.isUnlocked
          ? "hover:-translate-y-0.5 hover:border-[#8B5CF6]/40"
          : "opacity-72"
      }`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div
            className={`flex size-12 shrink-0 items-center justify-center rounded-lg border ${
              badgeTypeClassNames[badge.type]
            }`}
          >
            <BadgeTypeIcon type={badge.type} />
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold ${
              badge.isUnlocked
                ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-100"
                : "border-white/10 bg-white/[0.04] text-white/58"
            }`}
          >
            {badge.isUnlocked ? (
              <CheckCircle2 aria-hidden="true" className="size-3.5" />
            ) : (
              <LockKeyhole aria-hidden="true" className="size-3.5" />
            )}
            {badge.isUnlocked ? "Unlocked" : "Locked"}
          </span>
        </div>

        <div className="mt-5 min-w-0">
          <p className="text-xs font-bold uppercase text-[#C4B5FD]">
            {badge.type}
          </p>
          <h2 className="mt-2 text-lg font-black leading-tight">
            {badge.name}
          </h2>
          <p className="mt-3 min-h-12 text-sm leading-6 text-[#CBD5E1]">
            {badge.description}
          </p>
        </div>

        <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-[#94A3B8]">
          {badge.isUnlocked
            ? `Unlocked ${formatUnlockedDate(badge.unlockedAt)}`
            : "Keep completing trails to unlock"}
        </div>
      </CardContent>
    </Card>
  );
}

export { BadgeCard };
