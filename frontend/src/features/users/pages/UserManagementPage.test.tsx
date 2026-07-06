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
    vi.restoreAllMocks();
    resetAuthStore({ session: createTestSession({ role: "Admin" }) });
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
      await screen.findByText(
        "You need an admin or moderator account to view the user list.",
      ),
    ).toBeInTheDocument();
  });

  it("allows moderators to view users and suspend regular users only", async () => {
    resetAuthStore({ session: createTestSession({ role: "Moderator" }) });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      await mockResponse(usersResponse),
    );

    renderWithRouter(<UserManagementPage />);

    expect((await screen.findAllByText("Alex Walker")).length).toBeGreaterThan(0);
    expect(
      screen.queryByLabelText("Change role for Alex Walker"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByLabelText("Change status for Alex Walker"),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Change status for Admin User"),
    ).not.toBeInTheDocument();
    expect(screen.getAllByText("No action").length).toBeGreaterThan(0);
  });

  it("does not show role update controls for the current user", async () => {
    resetAuthStore({
      session: createTestSession({
        role: "Admin",
        userId: "user-2",
        email: "admin@example.com",
        displayName: "Admin User",
      }),
    });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      await mockResponse(usersResponse),
    );

    renderWithRouter(<UserManagementPage />);

    const adminRow = await screen.findByRole("row", { name: /Admin User/i });

    expect(
      within(adminRow).queryByLabelText("Change role for Admin User"),
    ).not.toBeInTheDocument();
    expect(
      within(adminRow).queryByLabelText("Change status for Admin User"),
    ).not.toBeInTheDocument();
    expect(within(adminRow).getAllByText("Current user")).toHaveLength(2);
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

    expect(
      screen.getByText(
        "This will change Alex Walker (alex@example.com) from User to Moderator.",
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Change role" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith(
        "http://localhost:5146/api/users/user-1/role",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer access-token",
          },
          body: JSON.stringify({ role: 2 }),
        },
      );
    });
    expect(
      await screen.findByText("Alex Walker is now Moderator."),
    ).toBeInTheDocument();
  });

  it("does not update a user role when the confirmation is cancelled", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(await mockResponse(usersResponse));

    renderWithRouter(<UserManagementPage />);

    const alexRow = await screen.findByRole("row", { name: /Alex Walker/i });
    const roleSelect = within(alexRow).getByLabelText(
      "Change role for Alex Walker",
    );

    await user.selectOptions(roleSelect, "Moderator");

    expect(
      screen.getByText(
        "This will change Alex Walker (alex@example.com) from User to Moderator.",
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Keep current role" }));

    await waitFor(() =>
      expect(
        screen.queryByText(
          "This will change Alex Walker (alex@example.com) from User to Moderator.",
        ),
      ).not.toBeInTheDocument(),
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(roleSelect).toHaveValue("User");
  });

  it("updates a user status and shows success feedback", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(await mockResponse(usersResponse))
      .mockResolvedValueOnce(
        await mockResponse({
          ...usersResponse[0],
          status: 1,
        }),
      );

    renderWithRouter(<UserManagementPage />);

    const alexRow = await screen.findByRole("row", { name: /Alex Walker/i });
    const statusSelect = within(alexRow).getByLabelText(
      "Change status for Alex Walker",
    );

    await user.selectOptions(statusSelect, "Suspended");

    expect(
      screen.getByText(
        "This will change Alex Walker (alex@example.com) from Active to Suspended.",
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Change status" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith(
        "http://localhost:5146/api/users/user-1/status",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer access-token",
          },
          body: JSON.stringify({ status: 1 }),
        },
      );
    });
    expect(
      await screen.findByText("Alex Walker is now Suspended."),
    ).toBeInTheDocument();
  });

  it("allows moderators to suspend a regular user", async () => {
    resetAuthStore({ session: createTestSession({ role: "Moderator" }) });
    const user = userEvent.setup();
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(await mockResponse(usersResponse))
      .mockResolvedValueOnce(
        await mockResponse({
          ...usersResponse[0],
          status: 1,
        }),
      );

    renderWithRouter(<UserManagementPage />);

    const alexRow = await screen.findByRole("row", { name: /Alex Walker/i });
    const statusSelect = within(alexRow).getByLabelText(
      "Change status for Alex Walker",
    );

    expect(within(statusSelect).queryByText("Deleted")).not.toBeInTheDocument();

    await user.selectOptions(statusSelect, "Suspended");
    await user.click(screen.getByRole("button", { name: "Change status" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith(
        "http://localhost:5146/api/users/user-1/status",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer access-token",
          },
          body: JSON.stringify({ status: 1 }),
        },
      );
    });
  });

  it("does not update a user status when the confirmation is cancelled", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(await mockResponse(usersResponse));

    renderWithRouter(<UserManagementPage />);

    const alexRow = await screen.findByRole("row", { name: /Alex Walker/i });
    const statusSelect = within(alexRow).getByLabelText(
      "Change status for Alex Walker",
    );

    await user.selectOptions(statusSelect, "Suspended");

    expect(
      screen.getByText(
        "This will change Alex Walker (alex@example.com) from Active to Suspended.",
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Keep current status" }));

    await waitFor(() =>
      expect(
        screen.queryByText(
          "This will change Alex Walker (alex@example.com) from Active to Suspended.",
        ),
      ).not.toBeInTheDocument(),
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(statusSelect).toHaveValue("Active");
  });
});
