import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTestSession, resetAuthStore } from "@/features/auth/testUtils";
import { renderWithRouter } from "@/test/renderWithRouter";

import type { CheckInApi } from "../services/checkInApi";
import { createCheckInApi } from "../services/checkInApi";
import { createCheckInResponse } from "../testUtils";

import { CheckInHistoryPage } from "./CheckInHistoryPage";

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
    getAllCheckIns: vi.fn(),
    getMyCheckInHistory: vi.fn().mockResolvedValue([]),
    updateCheckIn: vi.fn(),
    deleteCheckIn: vi.fn(),
    hideCheckIn: vi.fn(),
    restoreCheckIn: vi.fn(),
    ...overrides,
  };
}

describe("CheckInHistoryPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    resetAuthStore({ session: createTestSession() });
  });

  it("loads and displays the user's check-in history", async () => {
    createCheckInApiMock.mockReturnValue(
      createMockApi({
        getMyCheckInHistory: vi.fn().mockResolvedValue([
          createCheckInResponse({ notes: "Forest loop done." }),
          createCheckInResponse({
            id: "check-in-2",
            trailId: "trail-2",
            notes: null,
          }),
        ]),
      }),
    );

    renderWithRouter(<CheckInHistoryPage />);

    expect(screen.getByText("Loading check-ins")).toBeInTheDocument();
    expect(await screen.findByText("Forest loop done.")).toBeInTheDocument();
    expect(
      screen.getByText("No notes recorded for this completion."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore trails" })).toHaveAttribute(
      "href",
      "/trails",
    );
  });

  it("updates a check-in and replaces the displayed notes", async () => {
    const user = userEvent.setup();
    const updatedCheckIn = createCheckInResponse({
      notes: "Updated completion notes.",
    });
    const checkInApi = createMockApi({
      getMyCheckInHistory: vi.fn().mockResolvedValue([
        createCheckInResponse({ notes: "Original completion notes." }),
      ]),
      updateCheckIn: vi.fn().mockResolvedValue(updatedCheckIn),
    });
    createCheckInApiMock.mockReturnValue(checkInApi);

    renderWithRouter(<CheckInHistoryPage />);

    expect(await screen.findByText("Original completion notes.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.clear(screen.getByLabelText("Notes"));
    await user.type(screen.getByLabelText("Notes"), "  Updated completion notes.  ");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(checkInApi.updateCheckIn).toHaveBeenCalledWith(
        "access-token",
        "check-in-1",
        expect.objectContaining({
          notes: "Updated completion notes.",
        }),
      );
    });
    expect(await screen.findByText("Updated completion notes.")).toBeInTheDocument();
    expect(screen.queryByText("Original completion notes.")).not.toBeInTheDocument();
  });

  it("deletes a check-in after confirmation and shows empty state", async () => {
    const user = userEvent.setup();
    const checkInApi = createMockApi({
      getMyCheckInHistory: vi.fn().mockResolvedValue([createCheckInResponse()]),
      deleteCheckIn: vi.fn().mockResolvedValue(undefined),
    });
    createCheckInApiMock.mockReturnValue(checkInApi);

    renderWithRouter(<CheckInHistoryPage />);

    expect(await screen.findByText("Summit track completed.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByText("Delete check-in?")).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: "Delete" }).at(-1)!);

    await waitFor(() => {
      expect(checkInApi.deleteCheckIn).toHaveBeenCalledWith(
        "access-token",
        "check-in-1",
      );
    });
    expect(await screen.findByText("No check-ins yet")).toBeInTheDocument();
  });

  it("shows an authentication error when no session is available", async () => {
    const checkInApi = createMockApi();
    createCheckInApiMock.mockReturnValue(checkInApi);
    resetAuthStore({ session: null });

    renderWithRouter(<CheckInHistoryPage />);

    expect(
      await screen.findByText("Sign in again to view your check-ins."),
    ).toBeInTheDocument();
    expect(checkInApi.getMyCheckInHistory).not.toHaveBeenCalled();
  });
});
