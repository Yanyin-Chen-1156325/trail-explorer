import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Award,
  Loader2,
  Medal,
  Radio,
  Trophy,
  Wifi,
  WifiOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { leaderboardApiBaseUrl, leaderboardHubUrl } from "@/config/api";
import { runAuthenticatedRequest, useAuthStore } from "@/features/auth";
import { useToastStore } from "@/shared/store/toastStore";

import {
  LeaderboardApiError,
  createLeaderboardApi,
} from "../services/leaderboardApi";
import { createLeaderboardSignalRClient } from "../services/leaderboardSignalRClient";
import type {
  LeaderboardBadgeUnlock,
  LeaderboardEntry,
  LeaderboardRankingUpdate,
  LeaderboardXpUpdate,
} from "../types/leaderboard";

type LoadState =
  | { status: "loading" }
  | { status: "success"; leaderboard: LeaderboardEntry[] }
  | { status: "error"; message: string };

function formatNumber(value: number) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDistance(value: number) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1,
  }).format(value);
}

function rankClassName(rank: number) {
  if (rank === 1) {
    return "border-amber-300/35 bg-amber-400/15 text-amber-100";
  }

  if (rank === 2) {
    return "border-slate-200/30 bg-slate-200/12 text-slate-100";
  }

  if (rank === 3) {
    return "border-orange-300/30 bg-orange-400/12 text-orange-100";
  }

  return "border-emerald-300/20 bg-emerald-400/10 text-emerald-100";
}

function LeaderboardPage() {
  const session = useAuthStore((state) => state.session);
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [realtimeMessage, setRealtimeMessage] = useState<string | null>(null);
  const [badgeNotifications, setBadgeNotifications] = useState<
    LeaderboardBadgeUnlock[]
  >([]);
  const showToast = useToastStore((state) => state.showToast);
  const leaderboardApi = useMemo(
    () => createLeaderboardApi(leaderboardApiBaseUrl),
    [],
  );
  const currentUserId = session?.user.userId;
  const hasRealtimeConnection = Boolean(
    session?.accessToken && isRealtimeConnected,
  );

  const loadLeaderboard = async () => {
    if (!session?.accessToken) {
      setLoadState({
        status: "error",
        message: "Sign in again to view the leaderboard.",
      });
      return;
    }

    setLoadState({ status: "loading" });

    try {
      const leaderboard = await runAuthenticatedRequest((accessToken) =>
        leaderboardApi.getLeaderboard(accessToken),
      );
      setLoadState({ status: "success", leaderboard });
    } catch (error) {
      const message =
        error instanceof LeaderboardApiError
          ? error.message
          : "Unable to load the leaderboard.";

      setLoadState({
        status: "error",
        message,
      });
      showToast({
        title: "Leaderboard unavailable",
        description: message,
        variant: "error",
      });
    }
  };

  useEffect(() => {
    let isCurrent = true;

    const loadCurrentLeaderboard = async () => {
      if (!isCurrent) {
        return;
      }

      await loadLeaderboard();
    };

    void loadCurrentLeaderboard();

    return () => {
      isCurrent = false;
    };
    // loadLeaderboard intentionally captures the current session and API instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaderboardApi, session?.accessToken]);

  useEffect(() => {
    let isCurrent = true;

    if (!session?.accessToken) {
      return () => {
        isCurrent = false;
      };
    }

    const client = createLeaderboardSignalRClient({
      accessToken: session.accessToken,
      hubUrl: leaderboardHubUrl,
      onBadgeUnlocked: (badge) => {
        if (!isCurrent) {
          return;
        }

        setBadgeNotifications((current) => [badge, ...current].slice(0, 4));
        setRealtimeMessage(`${badge.name} badge unlocked`);
        showToast({
          title: `Badge unlocked: ${badge.name}`,
          description: badge.description,
          variant: "success",
        });
      },
      onLeaderboardUpdated: (leaderboard) => {
        if (!isCurrent) {
          return;
        }

        setLoadState({ status: "success", leaderboard });
        setRealtimeMessage("Leaderboard updated");
        showToast({
          title: "Leaderboard updated",
          description: "Rankings refreshed from live trail activity.",
          variant: "info",
        });
      },
      onRankingUpdated: (ranking: LeaderboardRankingUpdate) => {
        if (!isCurrent || ranking.userId !== currentUserId) {
          return;
        }

        setRealtimeMessage(`Your rank is now #${ranking.rank}`);
      },
      onXpUpdated: (xpUpdate: LeaderboardXpUpdate) => {
        if (!isCurrent || xpUpdate.userId !== currentUserId) {
          return;
        }

        setRealtimeMessage(
          `${formatNumber(xpUpdate.totalXp)} XP - Level ${xpUpdate.currentLevel}`,
        );
      },
    });

    const connect = async () => {
      setIsRealtimeConnected(false);

      try {
        await client.start();
        if (isCurrent) {
          setIsRealtimeConnected(true);
        }
      } catch {
        if (isCurrent) {
          setIsRealtimeConnected(false);
        }
      }
    };

    void connect();

    return () => {
      isCurrent = false;
      setIsRealtimeConnected(false);
      void client.stop();
    };
  }, [currentUserId, session?.accessToken, showToast]);

  const currentUserEntry =
    loadState.status === "success" && currentUserId
      ? loadState.leaderboard.find((entry) => entry.userId === currentUserId)
      : undefined;

  return (
    <main className="theme-page min-h-screen bg-[#0F172A] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold uppercase text-[#FCD34D]">
              <Trophy aria-hidden="true" className="size-4" />
              Leaderboard
            </p>
            <h1 className="mt-3 text-3xl font-black sm:text-4xl">
              Real-time trail rankings
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#94A3B8] sm:text-base">
              Rankings update from completed trails, XP, badge unlocks, and
              moderation changes.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/4 px-3 py-2 text-sm text-[#CBD5E1]">
            {hasRealtimeConnection ? (
              <Wifi aria-hidden="true" className="size-4 text-emerald-300" />
            ) : (
              <WifiOff aria-hidden="true" className="size-4 text-amber-300" />
            )}
            {hasRealtimeConnection ? "Live updates connected" : "Live updates offline"}
          </div>
        </section>

        {realtimeMessage ? (
          <p className="flex items-center gap-2 rounded-lg border border-emerald-300/25 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-100">
            <Radio aria-hidden="true" className="size-4" />
            {realtimeMessage}
          </p>
        ) : null}

        {badgeNotifications.length > 0 ? (
          <section className="grid gap-3 md:grid-cols-2" aria-label="Badge notifications">
            {badgeNotifications.map((badge) => (
              <div
                className="rounded-lg border border-[#C4B5FD]/25 bg-[#8B5CF6]/12 p-4 text-sm text-[#EDE9FE]"
                key={`${badge.badgeId}-${badge.unlockedAt}`}
              >
                <p className="flex items-center gap-2 font-bold">
                  <Award aria-hidden="true" className="size-4" />
                  Badge unlocked: {badge.name}
                </p>
                <p className="mt-1 text-[#C4B5FD]">{badge.description}</p>
              </div>
            ))}
          </section>
        ) : null}

        {currentUserEntry ? (
          <Card className="border-amber-300/20 bg-amber-400/10 text-white shadow-xl shadow-black/20">
            <CardContent className="grid gap-4 p-5 sm:grid-cols-4">
              <div>
                <p className="text-xs font-bold uppercase text-amber-100/70">
                  Your rank
                </p>
                <p className="mt-2 text-3xl font-black">#{currentUserEntry.rank}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-amber-100/70">
                  XP
                </p>
                <p className="mt-2 text-2xl font-black">
                  {formatNumber(currentUserEntry.totalXp)}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-amber-100/70">
                  Trails
                </p>
                <p className="mt-2 text-2xl font-black">
                  {formatNumber(currentUserEntry.completedTrails)}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-amber-100/70">
                  Badges
                </p>
                <p className="mt-2 text-2xl font-black">
                  {formatNumber(currentUserEntry.unlockedBadges)}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {loadState.status === "loading" ? (
          <div className="flex min-h-105 items-center justify-center rounded-lg border border-white/10 bg-[#071511] text-[#94A3B8]">
            <Loader2 aria-hidden="true" className="mr-2 size-5 animate-spin" />
            Loading leaderboard
          </div>
        ) : null}

        {loadState.status === "error" ? (
          <div className="flex min-h-105 flex-col items-center justify-center rounded-lg border border-red-400/25 bg-red-500/10 p-8 text-center">
            <AlertCircle aria-hidden="true" className="size-10 text-red-300" />
            <h2 className="mt-4 text-lg font-bold">Leaderboard unavailable</h2>
            <p className="mt-2 max-w-md text-sm text-red-100/75">
              {loadState.message}
            </p>
            <Button
              className="mt-5 border-red-200/25 bg-red-50/10 text-red-50 hover:bg-red-50/15"
              type="button"
              variant="outline"
              onClick={loadLeaderboard}
            >
              Try again
            </Button>
          </div>
        ) : null}

        {loadState.status === "success" ? (
          <section className="grid gap-3" aria-label="Leaderboard rankings">
            {loadState.leaderboard.length === 0 ? (
              <div className="rounded-lg border border-white/10 bg-[#071511] p-8 text-center text-[#94A3B8]">
                No leaderboard entries yet.
              </div>
            ) : (
              loadState.leaderboard.map((entry) => (
                <Card
                  className={`border bg-[#071511] text-white shadow-xl shadow-black/20 ${
                    entry.userId === currentUserId ? "ring-2 ring-amber-300/40" : ""
                  }`}
                  key={entry.userId}
                >
                  <CardContent className="grid gap-4 p-4 md:grid-cols-[auto_minmax(0,1fr)_repeat(4,auto)] md:items-center">
                    <div
                      className={`flex size-12 items-center justify-center rounded-lg border text-lg font-black ${rankClassName(
                        entry.rank,
                      )}`}
                    >
                      {entry.rank <= 3 ? (
                        <Medal aria-hidden="true" className="size-5" />
                      ) : (
                        `#${entry.rank}`
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-lg font-black">
                        {entry.displayName}
                      </p>
                      <p className="mt-1 text-sm text-[#94A3B8]">
                        Level {entry.currentLevel}
                        {entry.userId === currentUserId ? " - You" : ""}
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/4 px-3 py-2">
                      <p className="text-xs uppercase text-white/45">XP</p>
                      <p className="font-bold text-[#FCD34D]">
                        {formatNumber(entry.totalXp)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/4 px-3 py-2">
                      <p className="text-xs uppercase text-white/45">Trails</p>
                      <p className="font-bold">{formatNumber(entry.completedTrails)}</p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/4 px-3 py-2">
                      <p className="text-xs uppercase text-white/45">Distance</p>
                      <p className="font-bold">
                        {formatDistance(entry.totalDistanceKm)} km
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/4 px-3 py-2">
                      <p className="text-xs uppercase text-white/45">Badges</p>
                      <p className="font-bold text-[#C4B5FD]">
                        {formatNumber(entry.unlockedBadges)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </section>
        ) : null}
      </div>
    </main>
  );
}

export { LeaderboardPage };
