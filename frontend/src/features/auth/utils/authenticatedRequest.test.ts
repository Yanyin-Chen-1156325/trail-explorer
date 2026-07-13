import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTestSession, resetAuthStore } from "../testUtils";
import { useAuthStore } from "../store/authStore";
import { runAuthenticatedRequest } from "./authenticatedRequest";

const refreshedAuthResponse = {
  userId: "7b1b74e7-9ad5-4f08-a2ef-086f9a0f4a91",
  email: "alex@example.com",
  displayName: "Alex Walker",
  role: "User" as const,
  accessToken: "fresh-access-token",
  refreshToken: "fresh-refresh-token",
  expiresAt: new Date(Date.now() + 60_000).toISOString(),
};

function mockJsonResponse(body: unknown, ok = true, status = 200) {
  return Promise.resolve({
    ok,
    status,
    statusText: ok ? "OK" : "Unauthorized",
    json: () => Promise.resolve(body),
  } as Response);
}

function createStatusError(message: string, status: number) {
  return Object.assign(new Error(message), { status });
}

describe("runAuthenticatedRequest", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    resetAuthStore({ session: createTestSession() });
  });

  it("refreshes the session and retries once after a 401 response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      await mockJsonResponse(refreshedAuthResponse),
    );
    const request = vi
      .fn()
      .mockRejectedValueOnce(createStatusError("Expired token", 401))
      .mockResolvedValueOnce("success");

    await expect(runAuthenticatedRequest(request)).resolves.toBe("success");

    expect(request).toHaveBeenNthCalledWith(1, "access-token");
    expect(request).toHaveBeenNthCalledWith(2, "fresh-access-token");
    expect(useAuthStore.getState().session?.accessToken).toBe(
      "fresh-access-token",
    );
  });

  it("clears the session when refresh fails after a 401 response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      await mockJsonResponse({ message: "Invalid refresh token" }, false, 401),
    );
    const expiredTokenError = createStatusError("Expired token", 401);
    const request = vi.fn().mockRejectedValue(expiredTokenError);

    await expect(runAuthenticatedRequest(request)).rejects.toThrow(
      "Expired token",
    );

    expect(request).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().session).toBeNull();
  });

  it("does not clear the session for a 403 response", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      await mockJsonResponse(refreshedAuthResponse),
    );
    const request = vi
      .fn()
      .mockRejectedValue(createStatusError("Forbidden", 403));

    await expect(runAuthenticatedRequest(request)).rejects.toThrow("Forbidden");

    expect(fetchMock).not.toHaveBeenCalled();
    expect(useAuthStore.getState().session?.accessToken).toBe("access-token");
  });
});
