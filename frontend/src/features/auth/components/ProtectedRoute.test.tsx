import { Route, Routes } from "react-router-dom";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { renderWithRouter } from "@/test/renderWithRouter";

import { createTestSession, resetAuthStore } from "../testUtils";
import { ProtectedRoute } from "./ProtectedRoute";

describe("ProtectedRoute", () => {
  beforeEach(() => {
    resetAuthStore();
  });

  it("redirects unauthenticated users to login", async () => {
    renderWithRouter(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route element={<p>Protected Page</p>} path="/dashboard" />
        </Route>
        <Route element={<p>Login Page</p>} path="/login" />
      </Routes>,
      { initialEntries: ["/dashboard"] },
    );

    expect(await screen.findByText("Login Page")).toBeInTheDocument();
  });

  it("renders protected content for authenticated users", () => {
    resetAuthStore({ session: createTestSession() });

    renderWithRouter(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route element={<p>Protected Page</p>} path="/dashboard" />
        </Route>
        <Route element={<p>Login Page</p>} path="/login" />
      </Routes>,
      { initialEntries: ["/dashboard"] },
    );

    expect(screen.getByText("Protected Page")).toBeInTheDocument();
  });

  it("shows a loading state before auth hydration completes", () => {
    resetAuthStore({ isHydrated: false });

    renderWithRouter(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route element={<p>Protected Page</p>} path="/dashboard" />
        </Route>
      </Routes>,
      { initialEntries: ["/dashboard"] },
    );

    expect(screen.getByText("Loading session")).toBeInTheDocument();
  });
});
