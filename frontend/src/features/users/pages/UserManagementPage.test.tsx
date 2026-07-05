import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithRouter } from "@/test/renderWithRouter";
import { createTestSession, resetAuthStore } from "@/features/auth/testUtils";

import { UserManagementPage } from "./UserManagementPage";

const usersResponse = [
  {
    id: "user-1",
    email: "alex@example.com",
    displayName: "Alex Walker",
    role: 0,
    status: 0,
    authProvider: 0,
    createdAt: "2026-01-10T00:00:00.000Z",
    updatedAt: "2026-01-10T00:00:00.000Z",
  },
  {
    id: "user-2",
    email: "admin@example.com",
    displayName: "Admin User",
    role: 1,
    status: 0,
    authProvider: 1,
    createdAt: "2026-02-10T00:00:00.000Z",
    updatedAt: "2026-02-10T00:00:00.000Z",
  },
];

function mockResponse(body: unknown, ok = true, status = 200) {
  return Promise.resolve({
    ok,
    status,
    statusText: ok ? "OK" : "Forbidden",
    json: () => Promise.resolve(body),
  } as Response);
}

describe("UserManagementPage", () => {
  beforeEach(() => {
    resetAuthStore({ session: createTestSession() });
  });

  it("loads and displays users from the admin API", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      await mockResponse(usersResponse),
    );

    renderWithRouter(<UserManagementPage />);

    expect(screen.getByText("Loading users")).toBeInTheDocument();
    expect((await screen.findAllByText("Alex Walker")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("admin@example.com").length).toBeGreaterThan(0);
    expect(screen.getByText("Total users")).toBeInTheDocument();
  });

  it("shows an admin access error when the users API returns forbidden", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      await mockResponse({ message: "Forbidden" }, false, 403),
    );

    renderWithRouter(<UserManagementPage />);

    expect(
      await screen.findByText("You need an admin account to view the user list."),
    ).toBeInTheDocument();
  });

  it("updates a user role and shows success feedback", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(await mockResponse(usersResponse))
      .mockResolvedValueOnce(
        await mockResponse({
          ...usersResponse[0],
          role: 2,
        }),
      );

    renderWithRouter(<UserManagementPage />);

    const alexRow = await screen.findByRole("row", { name: /Alex Walker/i });
    const roleSelect = within(alexRow).getByLabelText(
      "Change role for Alex Walker",
    );

    await user.selectOptions(roleSelect, "Moderator");

    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith("/api/users/user-1/role", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer access-token",
        },
        body: JSON.stringify({ role: 2 }),
      });
    });
    expect(
      await screen.findByText("Alex Walker is now Moderator."),
    ).toBeInTheDocument();
  });
});
