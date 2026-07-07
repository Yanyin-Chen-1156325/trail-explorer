import { MapPin, Mountain, RouteIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
import type { TrailResponse } from "../types/trail";

interface TrailCardProps {
  trail: TrailResponse;
  linkToDetails?: boolean;
}

function difficultyClassName(difficulty: TrailResponse["difficulty"]) {
  if (difficulty === "Hard") {
    return "border-orange-400/40 bg-orange-500/18 text-orange-100";
  }

  if (difficulty === "Moderate") {
    return "border-amber-300/40 bg-amber-400/16 text-amber-100";
  }

  return "border-emerald-300/40 bg-emerald-400/16 text-emerald-100";
}

function TrailCard({ linkToDetails = false, trail }: TrailCardProps) {
  const card = (
    <Card className="overflow-hidden border-white/10 bg-white/[0.04] text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-[#10B981]/35 hover:bg-white/[0.06]">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold">{trail.name}</h2>
            <p className="mt-1 truncate text-xs text-white/60">
              {trail.city}, {trail.region}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-lg border px-2 py-1 text-xs font-bold ${difficultyClassName(
              trail.difficulty,
            )}`}
          >
            {trail.difficulty}
          </span>
        </div>

        <p className="mt-3 line-clamp-2 text-xs leading-5 text-white/58">
          {trail.description || "No trail description available yet."}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-white/68">
          <span className="flex min-w-0 items-center gap-1.5">
            <RouteIcon aria-hidden="true" className="size-4 shrink-0" />
            <span className="truncate">{trail.distanceKm} km</span>
          </span>
          <span className="flex min-w-0 items-center gap-1.5">
            <MapPin aria-hidden="true" className="size-4 shrink-0" />
            <span className="truncate">{trail.region}</span>
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3 text-xs font-semibold text-[#86EFAC]">
          <Mountain aria-hidden="true" className="size-4" />
          DOC trail
        </div>
      </CardContent>
    </Card>
  );

  if (!linkToDetails) {
    return card;
  }

  return (
    <Link
      className="block rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22C55E]/60"
      to={`/trails/${trail.id}`}
    >
      {card}
    </Link>
  );
}

export { TrailCard };
