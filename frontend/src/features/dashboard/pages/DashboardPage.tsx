import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Award,
  CalendarCheck,
  Eye,
  EyeOff,
  Flame,
  Loader2,
  Map,
  Medal,
  Mountain,
  RouteIcon,
  ShieldCheck,
  Trophy,
  UserCog,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  adminApiBaseUrl,
  checkInsApiBaseUrl,
  dashboardApiBaseUrl,
  usersApiBaseUrl,
} from "@/config/api";
import { runAuthenticatedRequest, useAuthStore } from "@/features/auth";
import { createCheckInApi } from "@/features/checkins/services/checkInApi";
import { XPProgressBar } from "@/features/progress";
import { createUserApi } from "@/features/users/services/userApi";
import { useToastStore } from "@/shared/store/toastStore";

import { DashboardApiError, createDashboardApi } from "../services/dashboardApi";
import type { DashboardResponse } from "../types/dashboard";

type LoadState =
  | { status: "loading" }
  | { status: "success"; dashboard: DashboardResponse }
  | { status: "error"; message: string };

type WorkspaceState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; summary: WorkspaceSummary }
  | { status: "error"; message: string };

interface WorkspaceSummary {
  totalUsers: number;
  adminUsers: number;
  moderatorUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalCheckIns: number;
  visibleCheckIns: number;
  hiddenCheckIns: number;
}

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

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value));
}

function StatCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card className="border-white/10 bg-[#071511] text-white shadow-xl shadow-black/20">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase text-[#94A3B8]">
              {label}
            </p>
            <p className="mt-3 text-3xl font-black leading-none">{value}</p>
            <p className="mt-3 text-sm leading-6 text-[#94A3B8]">{detail}</p>
          </div>
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-[#86EFAC]/25 bg-[#10B981]/12 text-[#86EFAC]">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function WorkspaceStatCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/4 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-[#94A3B8]">{label}</p>
          <p className="mt-2 text-2xl font-black">{value}</p>
          <p className="mt-2 text-sm text-[#94A3B8]">{detail}</p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-[#86EFAC]/25 bg-[#10B981]/12 text-[#86EFAC]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function WorkspacePanel({
  role,
  workspaceState,
  isSyncingDocTrails,
  onSyncDocTrails,
}: {
  role: string;
  workspaceState: WorkspaceState;
  isSyncingDocTrails: boolean;
  onSyncDocTrails: () => void;
}) {
  const isAdmin = role === "Admin";
  const title = isAdmin ? "Admin workspace" : "Moderator workspace";
  const description = isAdmin
    ? "Monitor account health, community activity, and moderation workload."
    : "Review check-in activity and keep community submissions visible and clean.";

  return (
    <Card className="border-white/10 bg-[#071511] text-white shadow-xl shadow-black/20">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold uppercase text-[#86EFAC]">
              {isAdmin ? (
                <UserCog aria-hidden="true" className="size-4" />
              ) : (
                <ShieldCheck aria-hidden="true" className="size-4" />
              )}
              {title}
            </p>
            <h2 className="mt-2 text-2xl font-black">
              {isAdmin ? "System overview" : "Moderation overview"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#94A3B8]">
              {description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {isAdmin ? (
              <Button
                className="border-[#10B981]/30 bg-[#10B981]/12 text-[#86EFAC] hover:bg-[#10B981]/20"
                disabled={isSyncingDocTrails}
                type="button"
                variant="outline"
                onClick={onSyncDocTrails}
              >
                {isSyncingDocTrails ? (
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                ) : (
                  <RouteIcon aria-hidden="true" className="size-4" />
                )}
                {isSyncingDocTrails ? "Syncing DOC trails" : "Sync DOC trails"}
              </Button>
            ) : null}
            <Button
              asChild
              className="border-white/15 bg-white/5 text-white hover:bg-white/10"
              variant="outline"
            >
              <Link to="/moderation/checkins">
                <ShieldCheck aria-hidden="true" className="size-4" />
                Moderation
              </Link>
            </Button>
            <Button
              asChild
              className="border-white/15 bg-white/5 text-white hover:bg-white/10"
              variant="outline"
            >
              <Link to="/admin/users">
                <Users aria-hidden="true" className="size-4" />
                Manage Users
              </Link>
            </Button>
          </div>
        </div>

        {workspaceState.status === "loading" ? (
          <div className="mt-5 flex items-center gap-2 rounded-lg border border-white/10 bg-white/4 px-4 py-3 text-sm text-[#94A3B8]">
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            Loading workspace summary
          </div>
        ) : null}

        {workspaceState.status === "error" ? (
          <div className="mt-5 rounded-lg border border-amber-300/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            {workspaceState.message}
          </div>
        ) : null}

        {workspaceState.status === "success" ? (
          <section
            aria-label={`${title} statistics`}
            className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4"
          >
            <WorkspaceStatCard
              detail={`${formatNumber(
                workspaceState.summary.activeUsers,
              )} active accounts`}
              icon={<Users aria-hidden="true" className="size-5" />}
              label="Users"
              value={formatNumber(workspaceState.summary.totalUsers)}
            />
            <WorkspaceStatCard
              detail={`${formatNumber(
                workspaceState.summary.moderatorUsers,
              )} moderators`}
              icon={<UserCog aria-hidden="true" className="size-5" />}
              label="Admins"
              value={formatNumber(workspaceState.summary.adminUsers)}
            />
            <WorkspaceStatCard
              detail={`${formatNumber(
                workspaceState.summary.visibleCheckIns,
              )} visible`}
              icon={<Eye aria-hidden="true" className="size-5" />}
              label="Check-ins"
              value={formatNumber(workspaceState.summary.totalCheckIns)}
            />
            <WorkspaceStatCard
              detail={`${formatNumber(
                workspaceState.summary.suspendedUsers,
              )} suspended users`}
              icon={<EyeOff aria-hidden="true" className="size-5" />}
              label="Hidden"
              value={formatNumber(workspaceState.summary.hiddenCheckIns)}
            />
          </section>
        ) : null}
      </CardContent>
    </Card>
  );
}

function DashboardPage() {
  const session = useAuthStore((state) => state.session);
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [workspaceState, setWorkspaceState] = useState<WorkspaceState>({
    status: "idle",
  });
  const [isSyncingDocTrails, setIsSyncingDocTrails] = useState(false);
  const showToast = useToastStore((state) => state.showToast);
  const dashboardApi = useMemo(
    () => createDashboardApi(dashboardApiBaseUrl, adminApiBaseUrl),
    [],
  );
  const userApi = useMemo(() => createUserApi(usersApiBaseUrl), []);
  const checkInApi = useMemo(() => createCheckInApi(checkInsApiBaseUrl), []);
  const currentUserRole = session?.user.role;
  const hasWorkspaceDashboard =
    currentUserRole === "Admin" || currentUserRole === "Moderator";

  const handleSyncDocTrails = async () => {
    if (currentUserRole !== "Admin") {
      return;
    }

    setIsSyncingDocTrails(true);

    try {
      const result = await runAuthenticatedRequest((accessToken) =>
        dashboardApi.syncDocTrails(accessToken),
      );

      if (!result.succeeded) {
        showToast({
          title: "DOC sync failed",
          description: result.errorMessage ?? "DOC trail sync did not complete.",
          variant: "error",
        });
        return;
      }

      showToast({
        title: "DOC sync completed",
        description: `${formatNumber(result.created)} created, ${formatNumber(
          result.updated,
        )} updated, ${formatNumber(result.skipped)} skipped.`,
        variant: "success",
      });
    } catch {
      showToast({
        title: "DOC sync failed",
        description: "Try again in a moment.",
        variant: "error",
      });
    } finally {
      setIsSyncingDocTrails(false);
    }
  };

  const loadDashboard = async () => {
    if (!session?.accessToken) {
      setLoadState({
        status: "error",
        message: "Sign in again to view your dashboard.",
      });
      return;
    }

    setLoadState({ status: "loading" });
    setWorkspaceState(hasWorkspaceDashboard ? { status: "loading" } : { status: "idle" });

    try {
      const dashboard = await runAuthenticatedRequest((accessToken) =>
        dashboardApi.getMyDashboard(accessToken),
      );
      setLoadState({ status: "success", dashboard });

      if (hasWorkspaceDashboard) {
        try {
          const [users, checkIns] = await runAuthenticatedRequest(
            async (accessToken) =>
              await Promise.all([
                userApi.getUsers(accessToken),
                checkInApi.getAllCheckIns(accessToken),
              ]),
          );

          setWorkspaceState({
            status: "success",
            summary: {
              totalUsers: users.length,
              adminUsers: users.filter((user) => user.role === "Admin").length,
              moderatorUsers: users.filter((user) => user.role === "Moderator")
                .length,
              activeUsers: users.filter((user) => user.status === "Active")
                .length,
              suspendedUsers: users.filter(
                (user) => user.status === "Suspended",
              ).length,
              totalCheckIns: checkIns.length,
              visibleCheckIns: checkIns.filter((checkIn) => !checkIn.isHidden)
                .length,
              hiddenCheckIns: checkIns.filter((checkIn) => checkIn.isHidden)
                .length,
            },
          });
        } catch {
          setWorkspaceState({
            status: "error",
            message: "Workspace summary could not be loaded.",
          });
        }
      }
    } catch (error) {
      setLoadState({
        status: "error",
        message:
          error instanceof DashboardApiError
            ? error.message
            : "Unable to load your dashboard.",
      });
    }
  };

  useEffect(() => {
    let isCurrent = true;

    const loadCurrentDashboard = async () => {
      if (!isCurrent) {
        return;
      }

      await loadDashboard();
    };

    void loadCurrentDashboard();

    return () => {
      isCurrent = false;
    };
    // loadDashboard intentionally captures the current session and API instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardApi, session?.accessToken, currentUserRole]);

  return (
    <main className="theme-page min-h-screen bg-[#0F172A] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold uppercase text-[#86EFAC]">
              <Mountain aria-hidden="true" className="size-4" />
              Dashboard
            </p>
            <h1 className="mt-3 text-3xl font-black sm:text-4xl">
              Trail progress overview
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#94A3B8] sm:text-base">
              Track XP, trail completions, streaks, badges, and ranking from
              your completed hikes.
            </p>
          </div>

          <Button
            asChild
            className="border-white/15 bg-white/5 text-white hover:bg-white/10"
            variant="outline"
          >
            <Link to="/trails">
              <RouteIcon aria-hidden="true" className="size-4" />
              Explore trails
            </Link>
          </Button>
        </section>

        {loadState.status === "loading" ? (
          <div className="flex min-h-105 items-center justify-center rounded-lg border border-white/10 bg-[#071511] text-[#94A3B8]">
            <Loader2 aria-hidden="true" className="mr-2 size-5 animate-spin" />
            Loading dashboard
          </div>
        ) : null}

        {loadState.status === "error" ? (
          <div className="flex min-h-105 flex-col items-center justify-center rounded-lg border border-red-400/25 bg-red-500/10 p-8 text-center">
            <AlertCircle aria-hidden="true" className="size-10 text-red-300" />
            <h2 className="mt-4 text-lg font-bold">Dashboard unavailable</h2>
            <p className="mt-2 max-w-md text-sm text-red-100/75">
              {loadState.message}
            </p>
            <Button
              className="mt-5 border-red-200/25 bg-red-50/10 text-red-50 hover:bg-red-50/15"
              type="button"
              variant="outline"
              onClick={loadDashboard}
            >
              Try again
            </Button>
          </div>
        ) : null}

        {loadState.status === "success" ? (
          <>
            {hasWorkspaceDashboard && currentUserRole ? (
              <WorkspacePanel
                isSyncingDocTrails={isSyncingDocTrails}
                role={currentUserRole}
                workspaceState={workspaceState}
                onSyncDocTrails={handleSyncDocTrails}
              />
            ) : null}

            <XPProgressBar progress={loadState.dashboard.progress} />

            <section
              aria-label="Dashboard statistics"
              className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
            >
              <StatCard
                detail={`${formatNumber(
                  loadState.dashboard.trailStatistics.uniqueTrailsCompleted,
                )} unique trails completed`}
                icon={<RouteIcon aria-hidden="true" className="size-5" />}
                label="Completed trails"
                value={formatNumber(
                  loadState.dashboard.userSummary.completedTrails,
                )}
              />
              <StatCard
                detail={`${formatDistance(
                  loadState.dashboard.distanceStatistics.averageDistanceKm,
                )} km average distance`}
                icon={<Map aria-hidden="true" className="size-5" />}
                label="Total distance"
                value={`${formatDistance(
                  loadState.dashboard.userSummary.totalDistanceKm,
                )} km`}
              />
              <StatCard
                detail="Consecutive active calendar weeks"
                icon={<Flame aria-hidden="true" className="size-5" />}
                label="Weekly streak"
                value={`${formatNumber(loadState.dashboard.weeklyStreak)} wk`}
              />
              <StatCard
                detail="Ranked by XP, completions, then distance"
                icon={<Trophy aria-hidden="true" className="size-5" />}
                label="Leaderboard rank"
                value={
                  loadState.dashboard.leaderboardRank > 0
                    ? `#${formatNumber(loadState.dashboard.leaderboardRank)}`
                    : "Unranked"
                }
              />
            </section>

            <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <Card className="border-white/10 bg-[#071511] text-white shadow-xl shadow-black/20">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="flex items-center gap-2 text-sm font-bold uppercase text-[#C4B5FD]">
                        <Award aria-hidden="true" className="size-4" />
                        Achievement summary
                      </p>
                      <h2 className="mt-2 text-xl font-black">
                        {formatNumber(
                          loadState.dashboard.userSummary.unlockedBadges,
                        )}{" "}
                        badges unlocked
                      </h2>
                    </div>
                    <Button
                      asChild
                      className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                      variant="outline"
                    >
                      <Link to="/badges">View badges</Link>
                    </Button>
                  </div>

                  {loadState.dashboard.recentBadges.length > 0 ? (
                    <ol className="mt-5 grid gap-3" aria-label="Recent badges">
                      {loadState.dashboard.recentBadges.map((badge) => (
                        <li
                          className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/4 p-3"
                          key={`${badge.id}-${badge.unlockedAt}`}
                        >
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#8B5CF6]/20 text-[#C4B5FD]">
                            <Medal aria-hidden="true" className="size-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold">{badge.name}</p>
                            <p className="mt-1 text-sm text-[#94A3B8]">
                              {badge.type} badge unlocked {formatDate(badge.unlockedAt)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <div className="mt-5 rounded-lg border border-white/10 bg-white/4 p-5 text-sm text-[#94A3B8]">
                      No badges unlocked yet.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-[#071511] text-white shadow-xl shadow-black/20">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="flex items-center gap-2 text-sm font-bold uppercase text-[#86EFAC]">
                        <CalendarCheck aria-hidden="true" className="size-4" />
                        Progress widgets
                      </p>
                      <h2 className="mt-2 text-xl font-black">
                        Recent check-ins
                      </h2>
                    </div>
                    <Button
                      asChild
                      className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                      variant="outline"
                    >
                      <Link to="/checkins">History</Link>
                    </Button>
                  </div>

                  {loadState.dashboard.recentCheckIns.length > 0 ? (
                    <ol
                      className="mt-5 grid gap-3"
                      aria-label="Recent check-ins"
                    >
                      {loadState.dashboard.recentCheckIns.map((checkIn) => (
                        <li
                          className="rounded-lg border border-white/10 bg-white/4 p-3"
                          key={checkIn.id}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-bold">
                                {checkIn.trailName}
                              </p>
                              <p className="mt-1 text-sm text-[#94A3B8]">
                                {checkIn.region} - {formatDate(checkIn.completedDate)}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-lg border border-[#86EFAC]/25 bg-[#10B981]/12 px-3 py-1 text-xs font-bold text-[#86EFAC]">
                              {formatDistance(checkIn.distanceKm)} km
                            </span>
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <div className="mt-5 rounded-lg border border-white/10 bg-white/4 p-5 text-sm text-[#94A3B8]">
                      No check-ins yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}

export { DashboardPage };
