import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithRouter } from "@/test/renderWithRouter";

import { createBadgeResponse, createBadgeWithType } from "../testUtils";
import type { BadgeType } from "../types/badge";
import { BadgeCard } from "./BadgeCard";

describe("BadgeCard", () => {
  it("renders unlocked badge details", () => {
    renderWithRouter(<BadgeCard badge={createBadgeResponse()} />);

    expect(screen.getByText("First Trail")).toBeInTheDocument();
    expect(screen.getByText("Complete your first trail.")).toBeInTheDocument();
    expect(screen.getByText("Completion")).toBeInTheDocument();
    expect(screen.getByText("Unlocked")).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.startsWith("Unlocked ")),
    ).toBeInTheDocument();
  });

  it("renders locked badge state", () => {
    renderWithRouter(
      <BadgeCard
        badge={createBadgeResponse({
          isUnlocked: false,
          unlockedAt: null,
        })}
      />,
    );

    expect(screen.getByText("Locked")).toBeInTheDocument();
    expect(screen.getByText("Keep completing trails to unlock")).toBeInTheDocument();
  });

  it.each<BadgeType>([
    "Completion",
    "Distance",
    "Region",
    "Difficulty",
    "Streak",
  ])("renders the %s badge type", (type) => {
    renderWithRouter(<BadgeCard badge={createBadgeWithType(type)} />);

    expect(screen.getByText(`${type} Badge`)).toBeInTheDocument();
    expect(screen.getByText(type)).toBeInTheDocument();
  });
});
