import { lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import { PublicOnlyRoute } from "./features/auth/components/PublicOnlyRoute";
import { RoleProtectedRoute } from "./features/auth/components/RoleProtectedRoute";
import { PublicLayout } from "./shared/layouts/PublicLayout";
import { ToastProvider } from "./shared/components/ToastProvider";
import { NotificationRealtimeProvider } from "./features/notifications/components/NotificationRealtimeProvider";

const HomePage = lazy(() =>
  import("./features/home/pages/HomePage").then(({ HomePage }) => ({
    default: HomePage,
  })),
);
const LoginPage = lazy(() =>
  import("./features/auth/pages/LoginPage").then(({ LoginPage }) => ({
    default: LoginPage,
  })),
);
const RegisterPage = lazy(() =>
  import("./features/auth/pages/RegisterPage").then(({ RegisterPage }) => ({
    default: RegisterPage,
  })),
);
const DashboardPage = lazy(() =>
  import("./features/dashboard/pages/DashboardPage").then(
    ({ DashboardPage }) => ({ default: DashboardPage }),
  ),
);
const ExplorePage = lazy(() =>
  import("./features/trails/pages/ExplorePage").then(({ ExplorePage }) => ({
    default: ExplorePage,
  })),
);
const TrailDetailPage = lazy(() =>
  import("./features/trails/pages/TrailDetailPage").then(
    ({ TrailDetailPage }) => ({ default: TrailDetailPage }),
  ),
);
const CheckInHistoryPage = lazy(() =>
  import("./features/checkins/pages/CheckInHistoryPage").then(
    ({ CheckInHistoryPage }) => ({ default: CheckInHistoryPage }),
  ),
);
const BadgeWallPage = lazy(() =>
  import("./features/badges/pages/BadgeWallPage").then(
    ({ BadgeWallPage }) => ({ default: BadgeWallPage }),
  ),
);
const LeaderboardPage = lazy(() =>
  import("./features/leaderboard/pages/LeaderboardPage").then(
    ({ LeaderboardPage }) => ({ default: LeaderboardPage }),
  ),
);
const NotificationListPage = lazy(() =>
  import("./features/notifications/pages/NotificationListPage").then(
    ({ NotificationListPage }) => ({ default: NotificationListPage }),
  ),
);
const CheckInModerationPage = lazy(() =>
  import("./features/checkins/pages/CheckInModerationPage").then(
    ({ CheckInModerationPage }) => ({ default: CheckInModerationPage }),
  ),
);
const UserManagementPage = lazy(() =>
  import("./features/users/pages/UserManagementPage").then(
    ({ UserManagementPage }) => ({ default: UserManagementPage }),
  ),
);

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ToastProvider />
      <NotificationRealtimeProvider />
      <Suspense
        fallback={
          <main aria-live="polite" className="mx-auto max-w-7xl px-4 py-12">
            Loading page...
          </main>
        }
      >
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
                element={
                  <RoleProtectedRoute allowedRoles={["Admin", "Moderator"]} />
                }
              >
                <Route
                  element={<CheckInModerationPage />}
                  path="/moderation/checkins"
                />
                <Route element={<UserManagementPage />} path="/admin/users" />
              </Route>
            </Route>
          </Route>

          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
