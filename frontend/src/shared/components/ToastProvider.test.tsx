import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { renderWithRouter } from "@/test/renderWithRouter";
import { useToastStore } from "@/shared/store/toastStore";

import { ToastProvider } from "./ToastProvider";

describe("ToastProvider", () => {
  beforeEach(() => {
    useToastStore.getState().clearToasts();
  });

  it("renders and dismisses toast notifications", async () => {
    const user = userEvent.setup();

    renderWithRouter(<ToastProvider />);

    act(() => {
      useToastStore.getState().showToast({
        title: "Leaderboard updated",
        description: "Rankings refreshed from live trail activity.",
        durationMs: 0,
      });
    });

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Leaderboard updated")).toBeInTheDocument();
    expect(
      screen.getByText("Rankings refreshed from live trail activity."),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Dismiss Leaderboard updated" }),
    );

    expect(screen.queryByText("Leaderboard updated")).not.toBeInTheDocument();
  });

  it("uses alert semantics for error toasts", () => {
    renderWithRouter(<ToastProvider />);

    act(() => {
      useToastStore.getState().showToast({
        title: "Leaderboard unavailable",
        variant: "error",
        durationMs: 0,
      });
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Leaderboard unavailable",
    );
  });
});
