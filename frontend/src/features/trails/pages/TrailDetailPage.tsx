import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Loader2,
  MapPin,
  Mountain,
  RouteIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trailsApiBaseUrl } from "@/config/api";
import { createTrailApi, TrailApiError } from "../services/trailApi";
import type { TrailResponse } from "../types/trail";

type LoadState =
  | { status: "loading" }
  | { status: "success"; trail: TrailResponse }
  | { status: "not-found" }
  | { status: "error"; message: string };

const trailApi = createTrailApi(trailsApiBaseUrl);

function difficultyClassName(difficulty: TrailResponse["difficulty"]) {
  if (difficulty === "Hard") {
    return "border-orange-400/40 bg-orange-500/18 text-orange-100";
  }

  if (difficulty === "Moderate") {
    return "border-amber-300/40 bg-amber-400/16 text-amber-100";
  }

  return "border-emerald-300/40 bg-emerald-400/16 text-emerald-100";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value));
}

function TrailDetailPage() {
  const { trailId } = useParams<{ trailId: string }>();
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    if (!trailId) {
      setLoadState({ status: "not-found" });
      return;
    }

    let isCurrent = true;

    const loadTrail = async () => {
      setLoadState({ status: "loading" });

      try {
        const trail = await trailApi.getTrailById(trailId);

        if (isCurrent) {
          setLoadState({ status: "success", trail });
        }
      } catch (error) {
        if (!isCurrent) {
          return;
        }

        if (error instanceof TrailApiError && error.status === 404) {
          setLoadState({ status: "not-found" });
          return;
        }

        setLoadState({
          status: "error",
          message:
            error instanceof TrailApiError
              ? error.message
              : "Unable to load trail details.",
        });
      }
    };

    void loadTrail();

    return () => {
      isCurrent = false;
    };
  }, [trailId]);

  return (
    <main className="min-h-screen bg-[#0F172A] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <Button
          asChild
          className="border-white/15 bg-white/5 text-white hover:bg-white/10"
          variant="outline"
        >
          <Link to="/trails">
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to trails
          </Link>
        </Button>

        {loadState.status === "loading" ? (
          <div className="flex min-h-[420px] items-center justify-center rounded-lg border border-white/10 bg-[#071511] text-[#94A3B8]">
            <Loader2 aria-hidden="true" className="mr-2 size-5 animate-spin" />
            Loading trail details
          </div>
        ) : null}

        {loadState.status === "not-found" ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-lg border border-white/10 bg-[#071511] p-8 text-center">
            <MapPin aria-hidden="true" className="size-10 text-[#86EFAC]" />
            <h1 className="mt-4 text-2xl font-black">Trail not found</h1>
            <p className="mt-2 max-w-md text-sm text-[#94A3B8]">
              This trail may be unavailable or no longer active.
            </p>
          </div>
        ) : null}

        {loadState.status === "error" ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-lg border border-red-400/25 bg-red-500/10 p-8 text-center">
            <AlertCircle aria-hidden="true" className="size-10 text-red-300" />
            <h1 className="mt-4 text-2xl font-black">Trail unavailable</h1>
            <p className="mt-2 max-w-md text-sm text-red-100/75">
              {loadState.message}
            </p>
          </div>
        ) : null}

        {loadState.status === "success" ? (
          <article className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <section className="overflow-hidden rounded-lg border border-white/10 bg-[#071511] shadow-2xl shadow-black/25">
              <div className="relative min-h-72 bg-[linear-gradient(135deg,rgba(16,185,129,0.2)_0_1px,transparent_1px_58px),linear-gradient(45deg,rgba(14,165,233,0.14)_0_1px,transparent_1px_46px)]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/22 via-transparent to-[#0EA5E9]/20" />
                <div className="absolute bottom-6 left-6 right-6">
                  <span
                    className={`inline-flex rounded-lg border px-3 py-1 text-xs font-bold ${difficultyClassName(
                      loadState.trail.difficulty,
                    )}`}
                  >
                    {loadState.trail.difficulty}
                  </span>
                  <h1 className="mt-4 text-3xl font-black sm:text-5xl">
                    {loadState.trail.name}
                  </h1>
                  <p className="mt-3 flex items-center gap-2 text-sm text-white/72">
                    <MapPin aria-hidden="true" className="size-4" />
                    {loadState.trail.city}, {loadState.trail.region}
                  </p>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <h2 className="text-lg font-bold">Trail description</h2>
                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#CBD5E1]">
                  {loadState.trail.description ||
                    "No trail description available yet."}
                </p>
              </div>
            </section>

            <aside className="space-y-4">
              <Card className="border-white/10 bg-[#071511] text-white shadow-xl shadow-black/20">
                <CardContent className="p-5">
                  <h2 className="text-base font-bold">Trail stats</h2>
                  <div className="mt-5 grid gap-4">
                    <div className="flex items-center gap-3">
                      <RouteIcon className="size-5 text-[#86EFAC]" />
                      <div>
                        <p className="text-xs text-white/55">Distance</p>
                        <p className="font-bold">
                          {loadState.trail.distanceKm} km
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mountain className="size-5 text-[#86EFAC]" />
                      <div>
                        <p className="text-xs text-white/55">Difficulty</p>
                        <p className="font-bold">
                          {loadState.trail.difficulty}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CalendarDays className="size-5 text-[#86EFAC]" />
                      <div>
                        <p className="text-xs text-white/55">Last updated</p>
                        <p className="font-bold">
                          {formatDate(loadState.trail.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/[0.04] text-white">
                <CardContent className="p-5">
                  <h2 className="text-base font-bold">Source</h2>
                  <p className="mt-3 text-sm text-[#94A3B8]">
                    DOC trail reference
                  </p>
                  <p className="mt-2 break-all rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/72">
                    {loadState.trail.docId}
                  </p>
                </CardContent>
              </Card>
            </aside>
          </article>
        ) : null}
      </div>
    </main>
  );
}

export { TrailDetailPage };
