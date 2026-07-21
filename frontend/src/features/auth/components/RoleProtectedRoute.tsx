import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

import type { AuthRole } from "../types/auth";
import { useAuthStore } from "../store/authStore";

interface RoleProtectedRouteProps {
  allowedRoles: readonly AuthRole[];
}

function RoleProtectedRoute({ allowedRoles }: RoleProtectedRouteProps) {
  const session = useAuthStore((state) => state.session);
  const refreshSession = useAuthStore((state) => state.refreshSession);
  const [hasRefreshedRole, setHasRefreshedRole] = useState(false);
  const hasAllowedRole =
    session?.user.role !== undefined && allowedRoles.includes(session.user.role);

  useEffect(() => {
    if (!session || hasAllowedRole || hasRefreshedRole) {
      return;
    }

    let isCurrent = true;

    const refreshRole = async () => {
      try {
        await refreshSession();
      } catch {
        // ProtectedRoute will redirect if refreshing clears the session.
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
  }, [hasAllowedRole, hasRefreshedRole, refreshSession, session]);

  if (!session) {
    return <Navigate replace to="/login" />;
  }

  if (!hasAllowedRole && !hasRefreshedRole) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0F172A] px-4 text-[#F8FAFC]">
        <div className="rounded-lg border border-white/10 bg-[#1E293B] px-5 py-4 text-sm text-[#94A3B8]">
          Checking permissions
        </div>
      </main>
    );
  }

  if (!hasAllowedRole) {
    return <Navigate replace to="/dashboard" />;
  }

  return <Outlet />;
}

export { RoleProtectedRoute };
export type { RoleProtectedRouteProps };
