import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithRouter } from "@/test/renderWithRouter";

import { resetAuthStore } from "../testUtils";
import { GoogleLoginButton } from "./GoogleLoginButton";

describe("GoogleLoginButton", () => {
  beforeEach(() => {
    resetAuthStore();
    vi.stubEnv("VITE_GOOGLE_CLIENT_ID", "");
  });

  it("shows a disabled fallback when Google sign-in is not configured", () => {
    renderWithRouter(<GoogleLoginButton />);

    expect(
      screen.getByRole("button", { name: "Continue with Google" }),
    ).toBeDisabled();
    expect(
      screen.getByText("Google sign-in is not configured."),
    ).toBeInTheDocument();
  });
});
