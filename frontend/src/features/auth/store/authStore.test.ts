import { beforeEach, describe, expect, it, vi } from "vitest";

import { resetAuthStore } from "../testUtils";
import { useAuthStore } from "./authStore";

const authResponse = {
  userId: "7b1b74e7-9ad5-4f08-a2ef-086f9a0f4a91",
  email: "alex@example.com",
  displayName: "Alex Walker",
  accessToken: "access-token",
  refreshToken: "refresh-token",
  expiresAt: new Date(Date.now() + 60_000).toISOString(),
};

function mockJsonResponse(body: unknown, ok = true, status = 200) {
  return Promise.resolve({
    ok,
    status,
    statusText: ok ? "OK" : "Bad Request",
    json: () => Promise.resolve(body),
  } as Response);
}

describe("authStore", () => {
  beforeEach(() => {
    resetAuthStore();
  });

  it("stores the session after a successful login", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(await mockJsonResponse(authResponse));

    await useAuthStore.getState().login({
      email: "alex@example.com",
      password: "Password1",
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "alex@example.com",
        password: "Password1",
      }),
    });
    expect(useAuthStore.getState().session?.user.email).toBe(
      "alex@example.com",
    );
  });

  it("stores an error after a failed login", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      await mockJsonResponse({ message: "Invalid credentials." }, false, 400),
    );

    await expect(
      useAuthStore.getState().login({
        email: "alex@example.com",
        password: "wrong-password",
      }),
    ).rejects.toThrow("Invalid credentials.");

    expect(useAuthStore.getState().error).toBe("Invalid credentials.");
    expect(useAuthStore.getState().session).toBeNull();
  });

  it("clears the session after logout succeeds", async () => {
    resetAuthStore({
      session: {
        user: {
          userId: authResponse.userId,
          email: authResponse.email,
          displayName: authResponse.displayName,
        },
        accessToken: authResponse.accessToken,
        refreshToken: authResponse.refreshToken,
        expiresAt: authResponse.expiresAt,
      },
    });

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      await mockJsonResponse(null),
    );

    await useAuthStore.getState().logout();

    expect(useAuthStore.getState().session).toBeNull();
    expect(useAuthStore.getState().error).toBeNull();
  });
});
