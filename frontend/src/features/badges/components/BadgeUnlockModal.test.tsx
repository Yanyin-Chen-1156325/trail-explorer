import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithRouter } from "@/test/renderWithRouter";

import { createBadgeResponse } from "../testUtils";
import { BadgeUnlockModal } from "./BadgeUnlockModal";

describe("BadgeUnlockModal", () => {
  it("renders unlocked badge message", () => {
    renderWithRouter(
      <BadgeUnlockModal
        badge={createBadgeResponse()}
        isOpen
        onOpenChange={() => undefined}
      />,
    );

    expect(screen.getByText("Badge unlocked")).toBeInTheDocument();
    expect(
      screen.getByText(/First Trail: Complete your first trail\./i),
    ).toBeInTheDocument();
  });

  it("closes from the action button", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithRouter(
      <BadgeUnlockModal
        badge={createBadgeResponse()}
        isOpen
        onOpenChange={onOpenChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "View badge wall" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
