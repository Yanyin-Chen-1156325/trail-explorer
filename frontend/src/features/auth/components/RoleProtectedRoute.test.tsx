import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithRouter } from "@/test/renderWithRouter";

import { createTestSession, resetAuthStore } from "../testUtils";
import { useAuthStore } from "../store/authStore";
import { RoleProtectedRoute } from "./RoleProtectedRoute";

function renderRoleProtectedRoute() {
  return renderWithRouter(
    <Routes>
      <Route
        element={<RoleProtectedRoute allowedRoles={["Admin", "Moderator"]} />}
      >
        <Route element={<p>Role protected page</p>} path="/admin" />
      </Route>
      <Route element={<p>Dashboard destination</p>} path="/dashboard" />
      <Route element={<p>Login destination</p>} path="/login" />
    </Routes>,
    { initialEntries: ["/admin"] },
  );
}

describe("RoleProtectedRoute", () => {
  beforeEach(() => {
    resetAuthStore();
  });

  it.each(["Admin", "Moderator"] as const)(
    "renders protected content for the %s role",
    (role) => {
      resetAuthStore({ session: createTestSession({ role }) });

      renderRoleProtectedRoute();

      expect(screen.getByText("Role protected page")).toBeInTheDocument();
    },
  );

  it("refreshes a stale role before allowing access", async () => {
    const refreshSession = vi.fn(async () => {
      useAuthStore.setState({
        session: createTestSession({ role: "Moderator" }),
      });
    });
    resetAuthStore({
      session: createTestSession({ role: "User" }),
      refreshSession,
    });

    renderRoleProtectedRoute();

    expect(await screen.findByText("Role protected page")).toBeInTheDocument();
    expect(refreshSession).toHaveBeenCalledOnce();
  });

  it("redirects users without an allowed role after refreshing", async () => {
    resetAuthStore({
      session: createTestSession({ role: "User" }),
      refreshSession: async () => undefined,
    });

    renderRoleProtectedRoute();

    expect(screen.getByText("Checking permissions")).toBeInTheDocument();
    expect(await screen.findByText("Dashboard destination")).toBeInTheDocument();
  });

  it("redirects unauthenticated users to login", async () => {
    renderRoleProtectedRoute();

    expect(await screen.findByText("Login destination")).toBeInTheDocument();
  });
});
