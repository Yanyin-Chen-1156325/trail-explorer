import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithRouter } from "@/test/renderWithRouter";

import { resetAuthStore } from "../testUtils";
import { useAuthStore } from "../store/authStore";
import { LoginPage } from "./LoginPage";

describe("LoginPage", () => {
  beforeEach(() => {
    resetAuthStore();
  });

  it("shows validation messages when submitted empty", async () => {
    const user = userEvent.setup();

    renderWithRouter(<LoginPage />);

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Password is required.")).toBeInTheDocument();
  });

  it("shows validation messages for invalid email and short password", async () => {
    const user = userEvent.setup();

    renderWithRouter(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.type(screen.getByLabelText("Password"), "short");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(
      screen.getByText("Password must be at least 8 characters."),
    ).toBeInTheDocument();
  });

  it("submits valid credentials through the auth store", async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockResolvedValue(undefined);
    resetAuthStore({ login });

    renderWithRouter(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), " alex@example.com ");
    await user.type(screen.getByLabelText("Password"), "Password1");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: "alex@example.com",
        password: "Password1",
      });
    });
  });

  it("displays the auth store error after a failed login", () => {
    useAuthStore.setState({ error: "Invalid email or password." });

    renderWithRouter(<LoginPage />);

    expect(screen.getAllByText("Invalid email or password.").length).toBeGreaterThan(
      0,
    );
  });
});
