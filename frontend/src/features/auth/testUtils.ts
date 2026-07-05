import { useAuthStore } from "./store/authStore";
import type { AuthSession, AuthState } from "./store/authStore";

const initialAuthState = useAuthStore.getState();

function createTestSession(
  overrides: Partial<AuthSession["user"]> = {},
): AuthSession {
  return {
    user: {
      userId: "7b1b74e7-9ad5-4f08-a2ef-086f9a0f4a91",
      email: "alex@example.com",
      displayName: "Alex Walker",
      ...overrides,
    },
    accessToken: "access-token",
    refreshToken: "refresh-token",
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
  };
}

function resetAuthStore(state: Partial<AuthState> = {}) {
  useAuthStore.setState(initialAuthState, true);
  useAuthStore.setState({
    session: null,
    isLoading: false,
    error: null,
    isHydrated: true,
    ...state,
  });
}

export { createTestSession, resetAuthStore };
