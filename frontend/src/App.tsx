import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Mountain, RouteIcon, Trophy } from "lucide-react";

import { HomePage } from "./features/home/pages/HomePage";
import { ExplorePage, TrailDetailPage } from "./features/trails";
import { UserManagementPage } from "./features/users";
import {
  LoginPage,
  ProtectedRoute,
  PublicOnlyRoute,
  RegisterPage,
  useAuthStore,
} from "./features/auth";
import { PublicLayout } from "./shared/layouts/PublicLayout";
import { CheckInHistoryPage, CheckInModerationPage } from "./features/checkins";
import { BadgeWallPage } from "./features/badges";
import { DashboardPage } from "./features/dashboard";
import { LeaderboardPage } from "./features/leaderboard";
import { ToastProvider } from "./shared/components/ToastProvider";
import {
  NotificationListPage,
  NotificationRealtimeProvider,
} from "./features/notifications";

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

export function ProtectedHomePage() {
  const session = useAuthStore((state) => state.session);

  return (
    <main className="min-h-screen bg-[#0F172A] px-4 py-10 text-[#F8FAFC] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl items-center">
        <section className="w-full rounded-lg border border-white/10 bg-[#1E293B] p-6 shadow-2xl shadow-black/25 sm:p-8 lg:p-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-lg bg-[#10B981]/15 text-[#10B981]">
                <Mountain aria-hidden="true" className="size-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#F8FAFC]">
                  Trail Explorer
                </p>
                <p className="text-sm text-[#94A3B8]">Protected route active</p>
              </div>
            </div>
          </div>

          <div className="mt-10 max-w-2xl space-y-4">
            <h1 className="text-4xl font-semibold sm:text-5xl">
              Welcome, {session?.user.displayName}.
            </h1>
            <p className="text-base leading-7 text-[#94A3B8] sm:text-lg">
              Authentication is active. Future dashboard, trail, and progress
              pages can now sit behind protected routes.
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-[#0F172A] p-4">
              <RouteIcon
                aria-hidden="true"
                className="mb-3 size-5 text-[#10B981]"
              />
              <p className="text-sm font-medium text-[#F8FAFC]">
                Route guard
              </p>
              <p className="mt-1 text-sm text-[#94A3B8]">
                Unauthenticated users are redirected to login.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-[#0F172A] p-4">
              <Trophy
                aria-hidden="true"
                className="mb-3 size-5 text-[#F59E0B]"
              />
              <p className="text-sm font-medium text-[#F8FAFC]">
                Session ready
              </p>
              <p className="mt-1 text-sm text-[#94A3B8]">
                Auth persistence is checked before redirects run.
              </p>
            </div>
          </div>

        </section>
      </div>
    </main>
  );
}

export function ManageUsersRoute() {
  const session = useAuthStore((state) => state.session);
  const refreshSession = useAuthStore((state) => state.refreshSession);
  const [hasRefreshedRole, setHasRefreshedRole] = useState(false);
  const canManageUsers =
    session?.user.role === "Admin" || session?.user.role === "Moderator";

  useEffect(() => {
    if (!session || canManageUsers || hasRefreshedRole) {
      return;
    }

    let isCurrent = true;

    const refreshRole = async () => {
      try {
        await refreshSession();
      } catch {
        // ProtectedRoute will redirect if the refresh clears the session.
      } finally {
        if (isCurrent) {
          setHasRefreshedRole(true);
        }
      }
    };

    void refreshRole();

    return () => {
      isCurrent = false;
    };
  }, [canManageUsers, hasRefreshedRole, refreshSession, session]);

  if (session && !canManageUsers && !hasRefreshedRole) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0F172A] px-4 text-[#F8FAFC]">
        <div className="rounded-lg border border-white/10 bg-[#1E293B] px-5 py-4 text-sm text-[#94A3B8]">
          Checking user permissions
        </div>
      </main>
    );
  }

  if (!canManageUsers) {
    return <Navigate replace to="/dashboard" />;
  }

  return <UserManagementPage />;
}

export function CheckInModerationRoute() {
  const session = useAuthStore((state) => state.session);
  const refreshSession = useAuthStore((state) => state.refreshSession);
  const [hasRefreshedRole, setHasRefreshedRole] = useState(false);
  const canModerate =
    session?.user.role === "Admin" || session?.user.role === "Moderator";

  useEffect(() => {
    if (!session || canModerate || hasRefreshedRole) {
      return;
    }

    let isCurrent = true;

    const refreshRole = async () => {
      try {
        await refreshSession();
      } catch {
        // ProtectedRoute will redirect if the refresh clears the session.
      } finally {
        if (isCurrent) {
          setHasRefreshedRole(true);
        }
      }
    };

    void refreshRole();

    return () => {
      isCurrent = false;
    };
  }, [canModerate, hasRefreshedRole, refreshSession, session]);

  if (session && !canModerate && !hasRefreshedRole) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0F172A] px-4 text-[#F8FAFC]">
        <div className="rounded-lg border border-white/10 bg-[#1E293B] px-5 py-4 text-sm text-[#94A3B8]">
          Checking moderation permissions
        </div>
      </main>
    );
  }

  if (!canModerate) {
    return <Navigate replace to="/dashboard" />;
  }

  return <CheckInModerationPage />;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ToastProvider />
      <NotificationRealtimeProvider />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route element={<HomePage />} path="/" />
          <Route element={<PublicOnlyRoute />}>
            <Route element={<LoginPage />} path="/login" />
            <Route element={<RegisterPage />} path="/register" />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardPage />} path="/dashboard" />
            <Route element={<ExplorePage />} path="/trails" />
            <Route element={<TrailDetailPage />} path="/trails/:trailId" />
            <Route element={<CheckInHistoryPage />} path="/checkins" />
            <Route element={<BadgeWallPage />} path="/badges" />
            <Route element={<LeaderboardPage />} path="/leaderboard" />
            <Route
              element={<NotificationListPage />}
              path="/notifications"
            />
            <Route
              element={<CheckInModerationRoute />}
              path="/moderation/checkins"
            />
            <Route element={<ManageUsersRoute />} path="/admin/users" />
          </Route>
        </Route>

        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
