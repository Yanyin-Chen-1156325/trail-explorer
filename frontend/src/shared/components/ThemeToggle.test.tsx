import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { renderWithRouter } from "@/test/renderWithRouter";
import { useThemeStore } from "@/shared/store/themeStore";

import { ThemeToggle } from "./ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    useThemeStore.getState().setTheme("dark");
  });

  it("toggles from dark to light mode", async () => {
    const user = userEvent.setup();

    renderWithRouter(<ThemeToggle />);

    await user.click(screen.getByRole("button", { name: "Switch to light mode" }));

    expect(useThemeStore.getState().theme).toBe("light");
    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("toggles from light to dark mode", async () => {
    const user = userEvent.setup();
    useThemeStore.getState().setTheme("light");

    renderWithRouter(<ThemeToggle />);

    await user.click(screen.getByRole("button", { name: "Switch to dark mode" }));

    expect(useThemeStore.getState().theme).toBe("dark");
    expect(document.documentElement).toHaveClass("dark");
  });
});
