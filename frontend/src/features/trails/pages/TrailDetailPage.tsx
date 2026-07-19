import "leaflet/dist/leaflet.css";

import type { ComponentType, PropsWithChildren } from "react";
import type { CSSProperties } from "react";
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
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { trailsApiBaseUrl } from "@/config/api";
import { CheckInForm } from "@/features/checkins";
import { createTrailApi, TrailApiError } from "../services/trailApi";
import type { TrailResponse } from "../types/trail";

type LoadState =
  | { status: "loading" }
  | { status: "success"; trail: TrailResponse }
  | { status: "not-found" }
  | { status: "error"; message: string };

type MapCenter = [number, number];

const trailApi = createTrailApi(trailsApiBaseUrl);
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
    eventHandlers?: {
      click: () => void;
    };
    radius: number;
    weight: number;
  }>
>;

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

function hasCoordinates(
  trail: TrailResponse,
): trail is TrailResponse & { latitude: number; longitude: number } {
  return typeof trail.latitude === "number" && typeof trail.longitude === "number";
}

function formatCoordinate(value: number) {
  return value.toFixed(5);
}

function createGoogleMapsUrl(latitude: number, longitude: number) {
  const query = `${latitude},${longitude}`;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query,
  )}`;
}

function createHeroBackgroundStyle(trail: TrailResponse): CSSProperties | undefined {
  if (!trail.imageUrl) {
    return undefined;
  }

  return {
    backgroundImage: `linear-gradient(90deg, rgba(2, 6, 23, 0.48), rgba(2, 6, 23, 0.12)), url("${trail.imageUrl}")`,
  };
}

function TrailLocationMap({ trail }: { trail: TrailResponse }) {
  const [isGoogleMapsDialogOpen, setIsGoogleMapsDialogOpen] = useState(false);
  const hasMappedLocation = hasCoordinates(trail);
  const center: MapCenter = hasMappedLocation
    ? [trail.latitude, trail.longitude]
    : [-43.532, 172.636];
  const googleMapsUrl = hasMappedLocation
    ? createGoogleMapsUrl(trail.latitude, trail.longitude)
    : "";

  const openGoogleMaps = () => {
    if (!googleMapsUrl) {
      return;
    }

    window.open(googleMapsUrl, "_blank", "noopener,noreferrer");
    setIsGoogleMapsDialogOpen(false);
  };

  return (
    <section className="border-t border-black/10 p-6 dark:border-white/10 sm:p-8">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold">Trail location</h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-[#56655D] dark:text-[#94A3B8]">
            <MapPin aria-hidden="true" className="size-4 text-[#86EFAC]" />
            {trail.city}, {trail.region}
          </p>
        </div>
        {hasMappedLocation ? (
          <div className="rounded-lg border border-black/10 bg-black/5 px-3 py-2 text-xs font-semibold text-[#56655D] dark:border-white/10 dark:bg-black/20 dark:text-white/70">
            {formatCoordinate(trail.latitude)}, {formatCoordinate(trail.longitude)}
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-lg border border-black/10 bg-[#EEF4E8] dark:border-white/10 dark:bg-[#0B1F1A]">
        {hasMappedLocation ? (
          <TrailMapContainer
            center={center}
            className="h-[320px] w-full"
            scrollWheelZoom={false}
            zoom={11}
          >
            <TrailTileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <TrailCircleMarker
              center={center}
              color="#047857"
              eventHandlers={{
                click: () => setIsGoogleMapsDialogOpen(true),
              }}
              fillColor="#10B981"
              fillOpacity={0.9}
              radius={10}
              weight={2}
            >
              <Popup>
                <div className="min-w-44 text-sm">
                  <p className="font-bold text-slate-950">{trail.name}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    {trail.city}, {trail.region}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-emerald-700">
                    {trail.distanceKm} km - {trail.difficulty}
                  </p>
                </div>
              </Popup>
            </TrailCircleMarker>
          </TrailMapContainer>
        ) : (
          <div className="flex min-h-[260px] flex-col items-center justify-center p-8 text-center">
            <MapPin aria-hidden="true" className="size-10 text-[#86EFAC]" />
            <h3 className="mt-4 text-base font-bold">No mapped coordinates</h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#56655D] dark:text-[#94A3B8]">
              This trail has a DOC location label, but no latitude and longitude
              are available yet.
            </p>
          </div>
        )}
      </div>

      <ConfirmationDialog
        cancelLabel="Stay here"
        confirmLabel="Open Google Maps"
        description={`Open ${trail.name} in Google Maps. On mobile, this may open the Google Maps app if it is installed.`}
        isOpen={isGoogleMapsDialogOpen}
        title="Open location?"
        onCancel={() => setIsGoogleMapsDialogOpen(false)}
        onConfirm={openGoogleMaps}
        onOpenChange={setIsGoogleMapsDialogOpen}
      />
    </section>
  );
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
    <main className="theme-page min-h-screen bg-[#F7F8F3] px-4 py-8 text-[#0B1511] dark:bg-[#0F172A] dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <Button
          asChild
          className="border-black/10 bg-white text-[#0B1511] hover:bg-[#EEF4E8] dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          variant="outline"
        >
          <Link to="/trails">
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to trails
          </Link>
        </Button>

        {loadState.status === "loading" ? (
          <div className="flex min-h-[420px] items-center justify-center rounded-lg border border-black/10 bg-white text-[#56655D] dark:border-white/10 dark:bg-[#071511] dark:text-[#94A3B8]">
            <Loader2 aria-hidden="true" className="mr-2 size-5 animate-spin" />
            Loading trail details
          </div>
        ) : null}

        {loadState.status === "not-found" ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-lg border border-black/10 bg-white p-8 text-center dark:border-white/10 dark:bg-[#071511]">
            <MapPin aria-hidden="true" className="size-10 text-[#86EFAC]" />
            <h1 className="mt-4 text-2xl font-black">Trail not found</h1>
            <p className="mt-2 max-w-md text-sm text-[#56655D] dark:text-[#94A3B8]">
              This trail may be unavailable or no longer active.
            </p>
          </div>
        ) : null}

        {loadState.status === "error" ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-lg border border-red-400/25 bg-red-500/10 p-8 text-center">
            <AlertCircle aria-hidden="true" className="size-10 text-red-300" />
            <h1 className="mt-4 text-2xl font-black">Trail unavailable</h1>
            <p className="mt-2 max-w-md text-sm text-[#991B1B] dark:text-red-100/75">
              {loadState.message}
            </p>
          </div>
        ) : null}

        {loadState.status === "success" ? (
          <article className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <section className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-2xl shadow-black/10 dark:border-white/10 dark:bg-[#071511] dark:shadow-black/25">
              <div
                aria-label={`${loadState.trail.name} hero image`}
                className="trail-detail-hero relative min-h-72 bg-[linear-gradient(135deg,rgba(16,185,129,0.2)_0_1px,transparent_1px_58px),linear-gradient(45deg,rgba(14,165,233,0.14)_0_1px,transparent_1px_46px)] bg-cover bg-center text-white"
                role="img"
                style={createHeroBackgroundStyle(loadState.trail)}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/75 via-[#020617]/25 to-[#020617]/10" />
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
                  <p className="mt-3 flex items-center gap-2 text-sm text-white/82">
                    <MapPin aria-hidden="true" className="size-4" />
                    {loadState.trail.city}, {loadState.trail.region}
                  </p>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <h2 className="text-lg font-bold">Trail description</h2>
                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#34463C] dark:text-[#CBD5E1]">
                  {loadState.trail.description ||
                    "No trail description available yet."}
                </p>
              </div>

              <TrailLocationMap trail={loadState.trail} />
            </section>

            <aside className="space-y-4">
              <CheckInForm trailId={loadState.trail.id} />

              <Card className="border-black/10 bg-white text-[#0B1511] shadow-xl shadow-black/10 dark:border-white/10 dark:bg-[#071511] dark:text-white dark:shadow-black/20">
                <CardContent className="p-5">
                  <h2 className="text-base font-bold">Trail stats</h2>
                  <div className="mt-5 grid gap-4">
                    <div className="flex items-center gap-3">
                      <RouteIcon className="size-5 text-[#86EFAC]" />
                      <div>
                        <p className="text-xs text-[#56655D] dark:text-white/55">Distance</p>
                        <p className="font-bold">
                          {loadState.trail.distanceKm} km
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mountain className="size-5 text-[#86EFAC]" />
                      <div>
                        <p className="text-xs text-[#56655D] dark:text-white/55">Difficulty</p>
                        <p className="font-bold">
                          {loadState.trail.difficulty}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CalendarDays className="size-5 text-[#86EFAC]" />
                      <div>
                        <p className="text-xs text-[#56655D] dark:text-white/55">Last updated</p>
                        <p className="font-bold">
                          {formatDate(loadState.trail.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
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
