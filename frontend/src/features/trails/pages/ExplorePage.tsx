import "leaflet/dist/leaflet.css";

import type { ComponentType, PropsWithChildren } from "react";
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
import { Link } from "react-router-dom";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";

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

type MapCenter = [number, number];

interface MappedTrail {
  trail: TrailResponse;
  position: MapCenter;
}

const trailApi = createTrailApi(trailsApiBaseUrl);
const difficultyOptions: Array<TrailDifficulty | "All"> = [
  "All",
  "Easy",
  "Moderate",
  "Hard",
];
const TrailMapContainer = MapContainer as unknown as ComponentType<
  PropsWithChildren<{
    center: MapCenter;
    className: string;
    scrollWheelZoom: boolean;
    zoom: number;
  }>
>;
const TrailTileLayer = TileLayer as unknown as ComponentType<{
  attribution: string;
  url: string;
}>;
const TrailCircleMarker = CircleMarker as unknown as ComponentType<
  PropsWithChildren<{
    center: MapCenter;
    color: string;
    fillColor: string;
    fillOpacity: number;
    radius: number;
    weight: number;
  }>
>;

function hasCoordinates(
  trail: TrailResponse,
): trail is TrailResponse & { latitude: number; longitude: number } {
  return typeof trail.latitude === "number" && typeof trail.longitude === "number";
}

function createMappedTrails(trails: TrailResponse[]): MappedTrail[] {
  return trails
    .filter(hasCoordinates)
    .slice(0, 12)
    .map((trail) => ({
      trail,
      position: [trail.latitude, trail.longitude],
    }));
}

function getMapCenter(mappedTrails: MappedTrail[]): MapCenter {
  if (mappedTrails.length === 0) {
    return [-43.532, 172.636];
  }

  const totals = mappedTrails.reduce(
    (current, marker) => ({
      latitude: current.latitude + marker.position[0],
      longitude: current.longitude + marker.position[1],
    }),
    { latitude: 0, longitude: 0 },
  );

  return [
    totals.latitude / mappedTrails.length,
    totals.longitude / mappedTrails.length,
  ];
}

function ExploreMap({ trails }: { trails: TrailResponse[] }) {
  const mappedTrails = useMemo(() => createMappedTrails(trails), [trails]);
  const center = useMemo(() => getMapCenter(mappedTrails), [mappedTrails]);

  return (
    <section
      aria-label="Trail map"
      className="relative min-h-105 overflow-hidden rounded-lg border border-white/10 bg-[#071511] shadow-2xl shadow-black/25"
    >
      {mappedTrails.length > 0 ? (
        <TrailMapContainer
          center={center}
          className="min-h-105 w-full"
          scrollWheelZoom={false}
          zoom={8}
        >
          <TrailTileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {mappedTrails.map((marker) => (
            <TrailCircleMarker
              center={marker.position}
              color="#047857"
              fillColor="#10B981"
              fillOpacity={0.9}
              key={marker.trail.id}
              radius={8}
              weight={2}
            >
              <Popup>
                <div className="min-w-44 text-sm">
                  <p className="font-bold text-slate-950">
                    {marker.trail.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    {marker.trail.region} - {marker.trail.distanceKm} km
                  </p>
                  <p className="mt-1 text-xs font-semibold text-emerald-700">
                    {marker.trail.difficulty}
                  </p>
                  <Link
                    className="mt-2 inline-flex text-xs font-bold text-emerald-700 underline-offset-2 hover:underline"
                    to={`/trails/${marker.trail.id}`}
                  >
                    View trail
                  </Link>
                </div>
              </Popup>
            </TrailCircleMarker>
          ))}
        </TrailMapContainer>
      ) : (
        <div className="flex min-h-105 flex-col items-center justify-center p-8 text-center">
          <MapPin aria-hidden="true" className="size-10 text-[#86EFAC]" />
          <h2 className="mt-4 text-lg font-bold">No mapped coordinates</h2>
          <p className="mt-2 max-w-md text-sm text-[#94A3B8]">
            Trails loaded successfully, but this page has no DOC coordinates to
            display on the map yet.
          </p>
        </div>
      )}

      <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#061813]/84 p-4 text-white backdrop-blur-md">
        <div>
          <p className="text-sm font-bold">DOC trail map</p>
          <p className="mt-1 text-xs text-white/60">
            Showing mapped DOC coordinates from the current page.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#86EFAC]">
          <RouteIcon aria-hidden="true" className="size-4" />
          {mappedTrails.length} markers
        </div>
      </div>
    </section>
  );
}

function TrailSummaryList({ trails }: { trails: TrailResponse[] }) {
  return (
    <section
      className="grid gap-3 md:grid-cols-2 xl:grid-cols-3"
      aria-label="Trail summaries"
    >
      {trails.map((trail) => (
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
    <main className="theme-page min-h-screen bg-[#0F172A] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
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
              <div className="rounded-lg border border-white/10 bg-white/4 px-4 py-3 text-sm text-white/75">
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
                  className="border-white/10 bg-white/4 pl-9 text-white placeholder:text-[#94A3B8] focus-visible:border-[#10B981] focus-visible:ring-[#10B981]/25"
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
            <div className="flex min-h-105 items-center justify-center rounded-lg border border-white/10 bg-[#071511] text-[#94A3B8]">
              <Loader2 aria-hidden="true" className="mr-2 size-5 animate-spin" />
              {activeSearch ? "Searching trails" : "Loading trail map"}
            </div>
          ) : null}

          {loadState.status === "error" ? (
            <div className="flex min-h-105 flex-col items-center justify-center rounded-lg border border-red-400/25 bg-red-500/10 p-8 text-center">
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
            <div className="flex min-h-105 flex-col items-center justify-center rounded-lg border border-white/10 bg-[#071511] p-8 text-center">
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

        <section className="space-y-4" aria-label="Mapped trail cards">
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
        </section>
      </div>
    </main>
  );
}

export { ExplorePage };
