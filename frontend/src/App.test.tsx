import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { createTestSession, resetAuthStore } from "@/features/auth/testUtils";
import { renderWithRouter } from "@/test/renderWithRouter";
import { SiteHeader } from "@/shared/components/SiteHeader";

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

  it("keeps desktop and mobile navigation at their responsive breakpoints", () => {
    resetAuthStore({ session: createTestSession({ role: "User" }) });

    renderWithRouter(<SiteHeader />);

    expect(screen.getByRole("navigation", { name: "Primary" })).toHaveClass(
      "hidden",
      "lg:flex",
    );
    expect(
      screen
        .getByRole("button", { name: "Open navigation menu" })
        .parentElement,
    ).toHaveClass("lg:hidden");
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
