import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithRouter } from "@/test/renderWithRouter";

import { createBadgeResponse } from "../testUtils";
import { BadgeWall } from "./BadgeWall";

describe("BadgeWall", () => {
  it("renders loading state", () => {
    renderWithRouter(<BadgeWall badges={[]} isLoading />);

    expect(screen.getByText("Loading badges")).toBeInTheDocument();
  });

  it("renders error state and retries", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    renderWithRouter(
      <BadgeWall
        badges={[]}
        errorMessage="Unable to load badges."
        onRetry={onRetry}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(screen.getByText("Badges unavailable")).toBeInTheDocument();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders empty state", () => {
    renderWithRouter(<BadgeWall badges={[]} />);

    expect(screen.getByText("No badges available")).toBeInTheDocument();
  });

  it("renders badge progress summary and grouped progression cards", () => {
    renderWithRouter(
      <BadgeWall
        badges={[
          createBadgeResponse({ id: "badge-1", name: "First Trail" }),
          createBadgeResponse({
            id: "badge-2",
            name: "Trail Explorer",
            isUnlocked: false,
            unlockedAt: null,
          }),
        ]}
      />,
    );

    expect(screen.getByText("Completion progression")).toBeInTheDocument();
    expect(screen.getByText("First Trail")).toBeInTheDocument();
    expect(screen.getByText("Trail Explorer")).toBeInTheDocument();
    expect(screen.getAllByText("50%")).toHaveLength(1);
    expect(screen.getByText("50% complete")).toBeInTheDocument();
  });

  it("renders per-tier progress labels inside progression groups", () => {
    renderWithRouter(
      <BadgeWall
        badges={[
          createBadgeResponse({
            id: "distance-50",
            name: "50km Explorer",
            type: "Distance",
            isUnlocked: false,
            unlockedAt: null,
            currentValue: 23,
            targetValue: 50,
            progressLabel: "23/50 km",
          }),
          createBadgeResponse({
            id: "distance-100",
            name: "100km Explorer",
            type: "Distance",
            isUnlocked: false,
            unlockedAt: null,
            currentValue: 23,
            targetValue: 100,
            progressLabel: "23/100 km",
          }),
          createBadgeResponse({
            id: "completion-10",
            name: "Trail Explorer",
            type: "Completion",
            isUnlocked: false,
            unlockedAt: null,
            currentValue: 3,
            targetValue: 10,
            progressLabel: "3/10 trails",
          }),
        ]}
      />,
    );

    expect(screen.getByText("Distance progression")).toBeInTheDocument();
    expect(screen.getByText("23/50 km")).toBeInTheDocument();
    expect(screen.getByText("23/100 km")).toBeInTheDocument();
    expect(screen.getByText("Completion progression")).toBeInTheDocument();
    expect(screen.getByText("3/10 trails")).toBeInTheDocument();
  });

  it("hides difficulty badge progression groups", () => {
    renderWithRouter(
      <BadgeWall
        badges={[
          createBadgeResponse({
            id: "completion-1",
            name: "First Trail",
            type: "Completion",
          }),
          createBadgeResponse({
            id: "difficulty-1",
            name: "Expert Explorer",
            type: "Difficulty",
          }),
        ]}
      />,
    );

    expect(screen.getByText("Completion progression")).toBeInTheDocument();
    expect(screen.getByText("First Trail")).toBeInTheDocument();
    expect(screen.queryByText("Difficulty progression")).not.toBeInTheDocument();
    expect(screen.queryByText("Expert Explorer")).not.toBeInTheDocument();
  });
});
