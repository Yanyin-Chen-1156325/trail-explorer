import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTestSession, resetAuthStore } from "@/features/auth/testUtils";
import { renderWithRouter } from "@/test/renderWithRouter";

import type { CheckInApi } from "../services/checkInApi";
import { createCheckInApi } from "../services/checkInApi";
import { createCheckInResponse } from "../testUtils";

import { CheckInModerationPage } from "./CheckInModerationPage";

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
    createCheckIn: vi.fn(),
    getAllCheckIns: vi.fn().mockResolvedValue([]),
    getMyCheckInHistory: vi.fn(),
    updateCheckIn: vi.fn(),
    deleteCheckIn: vi.fn(),
    hideCheckIn: vi.fn(),
    restoreCheckIn: vi.fn(),
    ...overrides,
  };
}

describe("CheckInModerationPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    resetAuthStore({ session: createTestSession({ role: "Moderator" }) });
  });

  it("loads all check-ins for moderation", async () => {
    const visibleCheckIn = createCheckInResponse({ notes: "Visible notes." });
    const hiddenCheckIn = createCheckInResponse({
      id: "check-in-2",
      notes: "Hidden notes.",
      isHidden: true,
    });
    createCheckInApiMock.mockReturnValue(
      createMockApi({
        getAllCheckIns: vi.fn().mockResolvedValue([visibleCheckIn, hiddenCheckIn]),
      }),
    );

    renderWithRouter(<CheckInModerationPage />);

    expect(screen.getByText("Loading check-ins")).toBeInTheDocument();
    expect(await screen.findByText("Visible notes.")).toBeInTheDocument();
    expect(screen.getByText("Hidden notes.")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "My check-ins" })).toHaveAttribute(
      "href",
      "/checkins",
    );
  });

  it("hides a visible check-in after confirmation", async () => {
    const user = userEvent.setup();
    const checkInApi = createMockApi({
      getAllCheckIns: vi.fn().mockResolvedValue([
        createCheckInResponse({ notes: "Needs review." }),
      ]),
      hideCheckIn: vi.fn().mockResolvedValue(
        createCheckInResponse({
          notes: "Needs review.",
          isHidden: true,
        }),
      ),
    });
    createCheckInApiMock.mockReturnValue(checkInApi);

    renderWithRouter(<CheckInModerationPage />);

    expect(await screen.findByText("Needs review.")).toBeInTheDocument();
    expect(screen.getByText("Visible")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Hide" }));
    expect(screen.getByText("Hide check-in?")).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: "Hide" }).at(-1)!);

    await waitFor(() => {
      expect(checkInApi.hideCheckIn).toHaveBeenCalledWith(
        "access-token",
        "check-in-1",
      );
    });
    expect(await screen.findByText("Check-in hidden.")).toBeInTheDocument();
    expect(screen.getByText("Hidden")).toBeInTheDocument();
  });

  it("restores a hidden check-in after confirmation", async () => {
    const user = userEvent.setup();
    const checkInApi = createMockApi({
      getAllCheckIns: vi.fn().mockResolvedValue([
        createCheckInResponse({
          notes: "Hidden by moderator.",
          isHidden: true,
        }),
      ]),
      restoreCheckIn: vi.fn().mockResolvedValue(
        createCheckInResponse({
          notes: "Hidden by moderator.",
          isHidden: false,
        }),
      ),
    });
    createCheckInApiMock.mockReturnValue(checkInApi);

    renderWithRouter(<CheckInModerationPage />);

    expect(await screen.findByText("Hidden by moderator.")).toBeInTheDocument();
    expect(screen.getByText("Hidden")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Restore" }));
    expect(screen.getByText("Restore check-in?")).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: "Restore" }).at(-1)!);

    await waitFor(() => {
      expect(checkInApi.restoreCheckIn).toHaveBeenCalledWith(
        "access-token",
        "check-in-1",
      );
    });
    expect(await screen.findByText("Check-in restored.")).toBeInTheDocument();
    expect(screen.getByText("Visible")).toBeInTheDocument();
  });
});
