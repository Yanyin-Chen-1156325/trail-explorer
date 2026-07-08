import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthStore } from "@/features/auth";
import { createTestSession, resetAuthStore } from "@/features/auth/testUtils";
import { renderWithRouter } from "@/test/renderWithRouter";
import { SiteHeader } from "@/shared/components/SiteHeader";

import { CheckInModerationRoute, ManageUsersRoute, ProtectedHomePage } from "./App";

vi.mock("@/features/checkins", () => ({
  CheckInHistoryPage: () => <p>Check-in history page</p>,
  CheckInModerationPage: () => <p>Check-in moderation page</p>,
}));

describe("ProtectedHomePage", () => {
  beforeEach(() => {
    resetAuthStore();
  });

  it("does not render the old in-page manage users button", () => {
    resetAuthStore({ session: createTestSession({ role: "User" }) });

    renderWithRouter(<ProtectedHomePage />);

    expect(
      screen.queryByRole("link", { name: /manage users/i }),
    ).not.toBeInTheDocument();
  });

  it("refreshes a stale role before blocking user management", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      {
        ok: true,
        status: 200,
        statusText: "OK",
        json: () => Promise.resolve([]),
      } as Response,
    );
    resetAuthStore({
      session: createTestSession({ role: "User" }),
      refreshSession: async () => {
        useAuthStore.setState({
          session: createTestSession({ role: "Moderator" }),
        });
      },
    });

    renderWithRouter(<ManageUsersRoute />, { initialEntries: ["/admin/users"] });

    await waitFor(() => {
      expect(screen.getByText("User Management")).toBeInTheDocument();
    });
  });
});

describe("SiteHeader", () => {
  beforeEach(() => {
    resetAuthStore();
  });

  it("hides manage users for regular users", () => {
    resetAuthStore({ session: createTestSession({ role: "User" }) });

    renderWithRouter(<SiteHeader />);

    expect(
      screen.queryByRole("link", { name: /manage users/i }),
    ).not.toBeInTheDocument();
  });

  it("shows manage users for moderators", () => {
    resetAuthStore({ session: createTestSession({ role: "Moderator" }) });

    renderWithRouter(<SiteHeader />);

    expect(
      screen.getAllByRole("link", { name: /manage users/i }).length,
    ).toBeGreaterThan(0);
  });

  it("shows check-in navigation for signed-in users", () => {
    resetAuthStore({ session: createTestSession({ role: "User" }) });

    renderWithRouter(<SiteHeader />);

    expect(
      screen.getAllByRole("link", { name: /check-ins/i }).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: /moderation/i })).not.toBeInTheDocument();
  });

  it("shows check-in moderation navigation for moderators", () => {
    resetAuthStore({ session: createTestSession({ role: "Moderator" }) });

    renderWithRouter(<SiteHeader />);

    expect(
      screen.getAllByRole("link", { name: /moderation/i }).length,
    ).toBeGreaterThan(0);
  });

  it("shows manage users for admins", () => {
    resetAuthStore({ session: createTestSession({ role: "Admin" }) });

    renderWithRouter(<SiteHeader />);

    expect(
      screen.getAllByRole("link", { name: /manage users/i }).length,
    ).toBeGreaterThan(0);
  });

  it("shows the signed-in user's name and keeps logout in the account menu", async () => {
    const user = userEvent.setup();
    resetAuthStore({
      session: createTestSession({
        displayName: "Machi C",
        email: "machi@example.com",
      }),
    });

    renderWithRouter(<SiteHeader />);

    const accountMenuButton = screen.getByRole("button", {
      name: /machi c account menu/i,
    });

    expect(accountMenuButton).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /logout/i })).not.toBeInTheDocument();

    await user.click(accountMenuButton);

    expect(screen.getByText("machi@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });
});

describe("CheckInModerationRoute", () => {
  beforeEach(() => {
    resetAuthStore();
  });

  it("renders moderation UI for moderators", async () => {
    resetAuthStore({ session: createTestSession({ role: "Moderator" }) });

    renderWithRouter(
      <Routes>
        <Route element={<CheckInModerationRoute />} path="/moderation/checkins" />
      </Routes>,
      { initialEntries: ["/moderation/checkins"] },
    );

    expect(await screen.findByText("Check-in moderation page")).toBeInTheDocument();
  });

  it("redirects regular users away from moderation after refreshing role", async () => {
    resetAuthStore({
      session: createTestSession({ role: "User" }),
      refreshSession: async () => undefined,
    });

    renderWithRouter(
      <Routes>
        <Route element={<CheckInModerationRoute />} path="/moderation/checkins" />
        <Route element={<p>Dashboard destination</p>} path="/dashboard" />
      </Routes>,
      { initialEntries: ["/moderation/checkins"] },
    );

    expect(screen.getByText("Checking moderation permissions")).toBeInTheDocument();
    expect(await screen.findByText("Dashboard destination")).toBeInTheDocument();
  });
});
