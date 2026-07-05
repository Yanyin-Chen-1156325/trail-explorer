import { Route, Routes } from "react-router-dom";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { renderWithRouter } from "@/test/renderWithRouter";

import { createTestSession, resetAuthStore } from "../testUtils";
import { PublicOnlyRoute } from "./PublicOnlyRoute";

describe("PublicOnlyRoute", () => {
  beforeEach(() => {
    resetAuthStore();
  });

  it("renders public content for unauthenticated users", () => {
    renderWithRouter(
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route element={<p>Login Page</p>} path="/login" />
        </Route>
        <Route element={<p>Dashboard Page</p>} path="/dashboard" />
      </Routes>,
      { initialEntries: ["/login"] },
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("redirects authenticated users to dashboard", async () => {
    resetAuthStore({ session: createTestSession() });

    renderWithRouter(
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route element={<p>Login Page</p>} path="/login" />
        </Route>
        <Route element={<p>Dashboard Page</p>} path="/dashboard" />
      </Routes>,
      { initialEntries: ["/login"] },
    );

    expect(await screen.findByText("Dashboard Page")).toBeInTheDocument();
  });

  it("shows a loading state before auth hydration completes", () => {
    resetAuthStore({ isHydrated: false });

    renderWithRouter(
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route element={<p>Login Page</p>} path="/login" />
        </Route>
      </Routes>,
      { initialEntries: ["/login"] },
    );

    expect(screen.getByText("Loading session")).toBeInTheDocument();
  });
});
