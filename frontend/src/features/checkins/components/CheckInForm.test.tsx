import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTestSession, resetAuthStore } from "@/features/auth/testUtils";

import type { CheckInApi } from "../services/checkInApi";
import { createCheckInApi } from "../services/checkInApi";
import { createCheckInResponse } from "../testUtils";

import { CheckInForm } from "./CheckInForm";

vi.mock("../services/checkInApi", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../services/checkInApi")>();

  return {
    ...actual,
    createCheckInApi: vi.fn(),
  };
});

const createCheckInApiMock = vi.mocked(createCheckInApi);

function createMockApi(overrides: Partial<CheckInApi> = {}): CheckInApi {
  return {
    createCheckIn: vi.fn().mockResolvedValue(createCheckInResponse()),
    getAllCheckIns: vi.fn(),
    getMyCheckInHistory: vi.fn(),
    updateCheckIn: vi.fn(),
    deleteCheckIn: vi.fn(),
    hideCheckIn: vi.fn(),
    restoreCheckIn: vi.fn(),
    ...overrides,
  };
}

describe("CheckInForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    resetAuthStore({ session: createTestSession() });
  });

  it("submits a trimmed check-in request and shows success feedback", async () => {
    const user = userEvent.setup();
    const checkInApi = createMockApi();
    createCheckInApiMock.mockReturnValue(checkInApi);
    const expectedCompletedDate = new Date("2026-01-02T12:00:00").toISOString();

    render(<CheckInForm trailId="trail-1" />);

    await user.clear(screen.getByLabelText("Completion date"));
    await user.type(screen.getByLabelText("Completion date"), "2026-01-02");
    await user.type(screen.getByLabelText("Notes"), "  Clear summit views  ");
    await user.type(
      screen.getByLabelText("Photo URL"),
      "  https://example.com/summit.jpg  ",
    );
    await user.click(screen.getByRole("button", { name: "Record completion" }));

    await waitFor(() => {
      expect(checkInApi.createCheckIn).toHaveBeenCalledWith("access-token", {
        trailId: "trail-1",
        completedDate: expectedCompletedDate,
        notes: "Clear summit views",
        photoUrl: "https://example.com/summit.jpg",
      });
    });
    expect(await screen.findByText("Trail completion recorded.")).toBeInTheDocument();
    expect(screen.getByLabelText("Notes")).toHaveValue("");
    expect(screen.getByLabelText("Photo URL")).toHaveValue("");
  });

  it("shows a sign-in error when no access token is available", async () => {
    const user = userEvent.setup();
    const checkInApi = createMockApi();
    createCheckInApiMock.mockReturnValue(checkInApi);
    resetAuthStore({ session: null });

    render(<CheckInForm trailId="trail-1" />);

    await user.click(screen.getByRole("button", { name: "Record completion" }));

    expect(
      screen.getByText("Sign in again before recording this completion."),
    ).toBeInTheDocument();
    expect(checkInApi.createCheckIn).not.toHaveBeenCalled();
  });
});
