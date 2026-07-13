import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { UserProgress } from "../types/userProgress";

import { XPProgressBar } from "./XPProgressBar";

const baseProgress: UserProgress = {
  totalXp: 750,
  currentLevel: 2,
  currentLevelMinimumXp: 500,
  nextLevel: 3,
  nextLevelMinimumXp: 1000,
  xpIntoCurrentLevel: 250,
  xpRequiredForNextLevel: 500,
  progressPercent: 50,
};

describe("XPProgressBar", () => {
  it("renders current level and XP progress toward the next level", () => {
    render(<XPProgressBar progress={baseProgress} />);

    expect(screen.getByText("Current Level")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("750 XP")).toBeInTheDocument();
    expect(screen.getByText("250 XP to Level 3")).toBeInTheDocument();
    expect(screen.getByText("250 / 500 XP")).toBeInTheDocument();
    expect(screen.getByText("Level 3 at 1,000 XP")).toBeInTheDocument();

    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "50",
    );
  });

  it("renders completed copy when the user is at max level", () => {
    render(
      <XPProgressBar
        progress={{
          ...baseProgress,
          totalXp: 25000,
          currentLevel: 10,
          currentLevelMinimumXp: 20000,
          nextLevel: null,
          nextLevelMinimumXp: null,
          xpIntoCurrentLevel: 5000,
          xpRequiredForNextLevel: 0,
          progressPercent: 100,
        }}
      />,
    );

    expect(screen.getByText("Max level reached")).toBeInTheDocument();
    expect(screen.getByText("All level rewards completed")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
  });

  it("clamps invalid progress percentages for the progressbar", () => {
    const { rerender } = render(
      <XPProgressBar
        progress={{
          ...baseProgress,
          progressPercent: 125,
        }}
      />,
    );

    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "100",
    );

    rerender(
      <XPProgressBar
        progress={{
          ...baseProgress,
          progressPercent: Number.NaN,
        }}
      />,
    );

    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
  });
});
