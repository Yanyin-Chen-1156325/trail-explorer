import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import { Mountain, RouteIcon, Trophy, UserCog } from "lucide-react";

import { HomePage } from "./features/home/pages/HomePage";
import { UserManagementPage } from "./features/users";
import {
  LoginPage,
  LogoutButton,
  ProtectedRoute,
  PublicOnlyRoute,
  RegisterPage,
  useAuthStore,
} from "./features/auth";
import { PublicLayout } from "./shared/layouts/PublicLayout";
import { Button } from "./components/ui/button";

function ProtectedHomePage() {
  const session = useAuthStore((state) => state.session);

  return (
    <main className="min-h-screen bg-[#0F172A] px-4 py-6 text-[#F8FAFC] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl items-center">
        <section className="w-full rounded-lg border border-white/10 bg-[#1E293B] p-6 shadow-2xl shadow-black/25 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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

            <LogoutButton />
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

          <div className="mt-8">
            <Button
              asChild
              className="h-11 bg-[#10B981] px-5 font-semibold text-[#052E2B] hover:bg-[#22C55E]"
            >
              <Link to="/admin/users">
                <UserCog aria-hidden="true" className="size-4" />
                Manage Users
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route element={<HomePage />} path="/" />
          <Route element={<PublicOnlyRoute />}>
            <Route element={<LoginPage />} path="/login" />
            <Route element={<RegisterPage />} path="/register" />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedHomePage />} path="/dashboard" />
          <Route element={<UserManagementPage />} path="/admin/users" />
        </Route>

        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
