import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Loader2,
  MapPin,
  Mountain,
  RouteIcon,
  Search,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trailsApiBaseUrl } from "@/config/api";
import { TrailCard } from "../components/TrailCard";
import { createTrailApi, TrailApiError } from "../services/trailApi";
import type { TrailDifficulty, TrailResponse } from "../types/trail";

type LoadState =
  | { status: "loading" }
  | { status: "success"; trails: TrailResponse[]; totalCount: number }
  | { status: "empty" }
  | { status: "error"; message: string };

interface MapMarker {
  trail: TrailResponse;
  left: string;
  top: string;
}

const trailApi = createTrailApi(trailsApiBaseUrl);
const difficultyOptions: Array<TrailDifficulty | "All"> = [
  "All",
  "Easy",
  "Moderate",
  "Hard",
];

function createMapMarkers(trails: TrailResponse[]): MapMarker[] {
  return trails.slice(0, 8).map((trail, index) => {
    const left = 16 + ((index * 19 + trail.name.length * 3) % 68);
    const top = 18 + ((index * 23 + trail.region.length * 5) % 58);

    return {
      trail,
      left: `${left}%`,
      top: `${top}%`,
    };
  });
}

function ExploreMap({ trails }: { trails: TrailResponse[] }) {
  const markers = useMemo(() => createMapMarkers(trails), [trails]);

  return (
    <section
      aria-label="Trail map"
      className="relative min-h-[420px] overflow-hidden rounded-lg border border-white/10 bg-[#071511] shadow-2xl shadow-black/25"
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(16,185,129,0.18)_0_1px,transparent_1px_56px),linear-gradient(45deg,rgba(148,163,184,0.12)_0_1px,transparent_1px_46px)]" />
      <div className="absolute inset-x-[-10%] top-[18%] h-28 rotate-[-8deg] rounded-full bg-[#0EA5E9]/18 blur-2xl" />
      <div className="absolute bottom-[-18%] left-[20%] h-64 w-80 rounded-full bg-[#10B981]/18 blur-3xl" />
      <div className="absolute inset-8 rounded-[2rem] border border-emerald-300/10" />

      <div className="absolute left-[8%] top-[16%] h-24 w-[68%] rounded-full border-t-2 border-dashed border-emerald-200/30" />
      <div className="absolute bottom-[18%] right-[10%] h-32 w-[62%] rounded-full border-b-2 border-dashed border-sky-200/25" />

      {markers.map((marker) => (
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          key={marker.trail.id}
          style={{ left: marker.left, top: marker.top }}
        >
          <div className="group relative">
            <span className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#10B981]/20 ring-1 ring-[#10B981]/40" />
            <span className="relative flex size-5 items-center justify-center rounded-full bg-[#10B981] text-[#052E1A] shadow-lg shadow-black/30">
              <MapPin aria-hidden="true" className="size-3.5" />
            </span>
            <span className="pointer-events-none absolute left-1/2 top-8 hidden w-56 -translate-x-1/2 rounded-lg border border-white/10 bg-[#0F172A] p-3 text-left shadow-xl shadow-black/35 group-hover:block">
              <span className="block truncate text-sm font-bold text-white">
                {marker.trail.name}
              </span>
              <span className="mt-1 block truncate text-xs text-white/60">
                {marker.trail.region} - {marker.trail.distanceKm} km
              </span>
            </span>
          </div>
        </div>
      ))}

      <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#061813]/84 p-4 text-white backdrop-blur-md">
        <div>
          <p className="text-sm font-bold">Canterbury trail map</p>
          <p className="mt-1 text-xs text-white/60">
            Showing the first mapped trails from the current page.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#86EFAC]">
          <RouteIcon aria-hidden="true" className="size-4" />
          {markers.length} markers
        </div>
      </div>
    </section>
  );
}

function TrailSummaryList({ trails }: { trails: TrailResponse[] }) {
  return (
    <section className="grid gap-3" aria-label="Trail summaries">
      {trails.slice(0, 5).map((trail) => (
        <TrailCard key={trail.id} linkToDetails trail={trail} />
      ))}
    </section>
  );
}

function ExplorePage() {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [activeDifficulty, setActiveDifficulty] = useState<
    TrailDifficulty | "All"
  >("All");
  const hasActiveFilters = Boolean(activeSearch) || activeDifficulty !== "All";

  useEffect(() => {
    let isCurrent = true;

    const loadTrails = async () => {
      setLoadState({ status: "loading" });

      try {
        const response = await trailApi.getTrails({
          pageNumber: 1,
          pageSize: 12,
          search: activeSearch || undefined,
          difficulty:
            activeDifficulty === "All" ? undefined : activeDifficulty,
        });

        if (!isCurrent) {
          return;
        }

        if (response.items.length === 0) {
          setLoadState({ status: "empty" });
          return;
        }

        setLoadState({
          status: "success",
          trails: response.items,
          totalCount: response.totalCount,
        });
      } catch (error) {
        if (!isCurrent) {
          return;
        }

        setLoadState({
          status: "error",
          message:
            error instanceof TrailApiError
              ? error.message
              : "Unable to load trails.",
        });
      }
    };

    void loadTrails();

    return () => {
      isCurrent = false;
    };
  }, [activeDifficulty, activeSearch]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActiveSearch(searchInput.trim());
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setActiveSearch("");
    setActiveDifficulty("All");
  };

  return (
    <main className="min-h-screen bg-[#0F172A] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold uppercase text-[#86EFAC]">
                <Mountain aria-hidden="true" className="size-4" />
                Explore
              </p>
              <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                Discover trails on the map
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#94A3B8] sm:text-base">
                Browse active DOC-synchronised trails and preview where your
                next hike could start.
              </p>
            </div>

            {loadState.status === "success" ? (
              <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/75">
                <span className="font-bold text-white">
                  {loadState.totalCount}
                </span>{" "}
                trails available
              </div>
            ) : null}
          </div>

          <form
            className="rounded-lg border border-white/10 bg-[#071511] p-3 shadow-xl shadow-black/15"
            onSubmit={handleSearchSubmit}
          >
            <label className="sr-only" htmlFor="trail-search">
              Search trails
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <Search
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]"
                />
                <Input
                  className="border-white/10 bg-white/[0.04] pl-9 text-white placeholder:text-[#94A3B8] focus-visible:border-[#10B981] focus-visible:ring-[#10B981]/25"
                  id="trail-search"
                  maxLength={100}
                  placeholder="Search by trail, city, region, or description"
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                />
              </div>
              <div className="flex gap-2">
                {hasActiveFilters ? (
                  <Button
                    className="h-11 border-white/15 bg-white/5 text-white hover:bg-white/10"
                    type="button"
                    variant="outline"
                    onClick={handleClearFilters}
                  >
                    <X aria-hidden="true" className="size-4" />
                    Clear
                  </Button>
                ) : null}
                <Button
                  className="h-11 bg-[#10B981] px-5 font-bold text-[#052E1A] hover:bg-[#34D399]"
                  type="submit"
                >
                  Search
                </Button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2" aria-label="Difficulty">
              {difficultyOptions.map((difficulty) => {
                const isSelected = activeDifficulty === difficulty;

                return (
                  <Button
                    aria-pressed={isSelected}
                    className={`h-9 px-3 text-xs font-bold ${
                      isSelected
                        ? "border-[#10B981] bg-[#10B981] text-[#052E1A] hover:bg-[#34D399]"
                        : "border-white/15 bg-white/5 text-white hover:bg-white/10"
                    }`}
                    key={difficulty}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => setActiveDifficulty(difficulty)}
                  >
                    {difficulty}
                  </Button>
                );
              })}
            </div>
            {hasActiveFilters ? (
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#94A3B8]">
                {activeSearch ? (
                  <p>
                    Search{" "}
                    <span className="font-semibold text-white">
                      {activeSearch}
                    </span>
                  </p>
                ) : null}
                {activeDifficulty !== "All" ? (
                  <p>
                    Difficulty{" "}
                    <span className="font-semibold text-white">
                      {activeDifficulty}
                    </span>
                  </p>
                ) : null}
              </div>
            ) : null}
          </form>

          {loadState.status === "loading" ? (
            <div className="flex min-h-[420px] items-center justify-center rounded-lg border border-white/10 bg-[#071511] text-[#94A3B8]">
              <Loader2 aria-hidden="true" className="mr-2 size-5 animate-spin" />
              {activeSearch ? "Searching trails" : "Loading trail map"}
            </div>
          ) : null}

          {loadState.status === "error" ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-lg border border-red-400/25 bg-red-500/10 p-8 text-center">
              <AlertCircle aria-hidden="true" className="size-10 text-red-300" />
              <h2 className="mt-4 text-lg font-bold">Map unavailable</h2>
              <p className="mt-2 max-w-md text-sm text-red-100/75">
                {loadState.message}
              </p>
              <Button
                className="mt-5 bg-[#10B981] text-[#052E1A] hover:bg-[#34D399]"
                type="button"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          ) : null}

          {loadState.status === "empty" ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-lg border border-white/10 bg-[#071511] p-8 text-center">
              <MapPin aria-hidden="true" className="size-10 text-[#86EFAC]" />
              <h2 className="mt-4 text-lg font-bold">No trails found</h2>
              <p className="mt-2 max-w-md text-sm text-[#94A3B8]">
                {hasActiveFilters
                  ? "No active trails match your current search and difficulty filters."
                  : "Trails will appear here after synchronisation brings active DOC trail data into the app."}
              </p>
              {hasActiveFilters ? (
                <Button
                  className="mt-5 border-white/15 bg-white/5 text-white hover:bg-white/10"
                  type="button"
                  variant="outline"
                  onClick={handleClearFilters}
                >
                  <X aria-hidden="true" className="size-4" />
                  Clear filters
                </Button>
              ) : null}
            </div>
          ) : null}

          {loadState.status === "success" ? (
            <ExploreMap trails={loadState.trails} />
          ) : null}
        </section>

        <aside className="space-y-4">
          <Card className="border-white/10 bg-[#071511] text-white shadow-xl shadow-black/20">
            <CardContent className="p-5">
              <h2 className="text-base font-bold">Mapped trails</h2>
              <p className="mt-2 text-sm leading-6 text-[#94A3B8]">
                This explore view combines map-based discovery with searchable
                trail cards and difficulty filtering.
              </p>
            </CardContent>
          </Card>

          {loadState.status === "success" ? (
            <TrailSummaryList trails={loadState.trails} />
          ) : null}
        </aside>
      </div>
    </main>
  );
}

export { ExplorePage };
