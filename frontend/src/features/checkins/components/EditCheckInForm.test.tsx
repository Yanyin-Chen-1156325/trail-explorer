import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { createCheckInResponse } from "../testUtils";

import { EditCheckInForm } from "./EditCheckInForm";

describe("EditCheckInForm", () => {
  it("submits trimmed update details and shows success feedback", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    const expectedCompletedDate = new Date("2026-01-03T12:00:00").toISOString();

    render(
      <EditCheckInForm
        checkIn={createCheckInResponse({
          completedDate: "2026-01-01T00:00:00.000Z",
          notes: "Original notes",
        })}
        isSaving={false}
        onCancel={vi.fn()}
        onSave={onSave}
      />,
    );

    await user.clear(screen.getByLabelText("Completion date"));
    await user.type(screen.getByLabelText("Completion date"), "2026-01-03");
    await user.clear(screen.getByLabelText("Notes"));
    await user.type(screen.getByLabelText("Notes"), "  Updated notes  ");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        completedDate: expectedCompletedDate,
        notes: "Updated notes",
      });
    });
    expect(await screen.findByText("Check-in updated.")).toBeInTheDocument();
  });

  it("shows an error when saving fails", async () => {
    const user = userEvent.setup();

    render(
      <EditCheckInForm
        checkIn={createCheckInResponse()}
        isSaving={false}
        onCancel={vi.fn()}
        onSave={vi.fn().mockRejectedValue(new Error("Update rejected"))}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByText("Update rejected")).toBeInTheDocument();
  });
});
