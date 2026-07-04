import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "../store/authStore";

function PublicOnlyRoute() {
  const session = useAuthStore((state) => state.session);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  if (!isHydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0F172A] px-4 text-[#F8FAFC]">
        <div className="rounded-lg border border-white/10 bg-[#1E293B] px-5 py-4 text-sm text-[#94A3B8]">
          Loading session
        </div>
      </main>
    );
  }

  if (session) {
    return <Navigate replace to="/" />;
  }

  return <Outlet />;
}

export { PublicOnlyRoute };
