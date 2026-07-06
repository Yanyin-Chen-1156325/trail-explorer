import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithRouter } from "@/test/renderWithRouter";

import { resetAuthStore } from "../testUtils";
import { useAuthStore } from "../store/authStore";
import { RegisterPage } from "./RegisterPage";

describe("RegisterPage", () => {
  beforeEach(() => {
    resetAuthStore();
  });

  it("shows validation messages when submitted empty", async () => {
    const user = userEvent.setup();

    renderWithRouter(<RegisterPage />);

    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(screen.getByText("Display name is required.")).toBeInTheDocument();
    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Password is required.")).toBeInTheDocument();
    expect(screen.getByText("Confirm your password.")).toBeInTheDocument();
  });

  it("shows an error when passwords do not match", async () => {
    const user = userEvent.setup();

    renderWithRouter(<RegisterPage />);

    await user.type(screen.getByLabelText("Display name"), "Alex Walker");
    await user.type(screen.getByLabelText("Email"), "alex@example.com");
    await user.type(screen.getByLabelText("Password"), "Password1");
    await user.type(screen.getByLabelText("Confirm password"), "Password2");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
  });

  it("shows validation errors for invalid email and weak password", async () => {
    const user = userEvent.setup();

    renderWithRouter(<RegisterPage />);

    await user.type(screen.getByLabelText("Display name"), "Alex Walker");
    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.type(screen.getByLabelText("Password"), "password");
    await user.type(screen.getByLabelText("Confirm password"), "password");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(
      screen.getByText("Password must meet all requirements."),
    ).toBeInTheDocument();
  });

  it("updates password requirement indicators as the user types", async () => {
    const user = userEvent.setup();

    renderWithRouter(<RegisterPage />);

    await user.type(screen.getByLabelText("Password"), "Password1");

    expect(screen.getByText("8-128 characters")).toBeInTheDocument();
    expect(screen.getByText("Uppercase letter")).toBeInTheDocument();
    expect(screen.getByText("Lowercase letter")).toBeInTheDocument();
    expect(screen.getByText("Number")).toBeInTheDocument();
  });

  it("submits valid registration details through the auth store", async () => {
    const user = userEvent.setup();
    const register = vi.fn().mockResolvedValue(undefined);
    resetAuthStore({ register });

    renderWithRouter(<RegisterPage />);

    await user.type(screen.getByLabelText("Display name"), "Alex Walker");
    await user.type(screen.getByLabelText("Email"), " alex@example.com ");
    await user.type(screen.getByLabelText("Password"), "Password1");
    await user.type(screen.getByLabelText("Confirm password"), "Password1");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith({
        displayName: "Alex Walker",
        email: "alex@example.com",
        password: "Password1",
      });
    });
  });

  it("clears stale auth errors when the page opens", async () => {
    useAuthStore.setState({ error: "Invalid email or password." });

    renderWithRouter(<RegisterPage />);

    await waitFor(() => {
      expect(
        screen.queryByText("Invalid email or password."),
      ).not.toBeInTheDocument();
    });
  });
});
