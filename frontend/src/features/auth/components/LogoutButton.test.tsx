import { Route, Routes } from "react-router-dom";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithRouter } from "@/test/renderWithRouter";

import { createTestSession, resetAuthStore } from "../testUtils";
import { LogoutButton } from "./LogoutButton";

describe("LogoutButton", () => {
  beforeEach(() => {
    resetAuthStore({ session: createTestSession() });
  });

  it("logs out and redirects to login", async () => {
    const user = userEvent.setup();
    const logout = vi.fn().mockResolvedValue(undefined);
    resetAuthStore({ session: createTestSession(), logout });

    renderWithRouter(
      <Routes>
        <Route element={<LogoutButton />} path="/dashboard" />
        <Route element={<p>Login Page</p>} path="/login" />
      </Routes>,
      { initialEntries: ["/dashboard"] },
    );

    await user.click(screen.getByRole("button", { name: "Logout" }));

    await waitFor(() => {
      expect(logout).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText("Login Page")).toBeInTheDocument();
  });
});
