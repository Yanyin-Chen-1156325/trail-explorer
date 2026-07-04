import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { AuthApiError, createAuthApi } from "../services/authApi";
import type {
  AuthResponse,
  GoogleOAuthRequest,
  LoginRequest,
  RegisterRequest,
} from "../types/auth";

export interface AuthUser {
  userId: string;
  email: string;
  displayName: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface AuthState {
  session: AuthSession | null;
  isLoading: boolean;
  error: string | null;
  isHydrated: boolean;
  setSession: (response: AuthResponse) => void;
  clearSession: () => void;
  clearError: () => void;
  register: (request: RegisterRequest) => Promise<void>;
  login: (request: LoginRequest) => Promise<void>;
  googleOAuth: (request: GoogleOAuthRequest) => Promise<void>;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
  markHydrated: () => void;
}

const authApi = createAuthApi();
const storageKey = "trail-explorer-auth";

function toSession(response: AuthResponse): AuthSession {
  return {
    user: {
      userId: response.userId,
      email: response.email,
      displayName: response.displayName,
    },
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    expiresAt: response.expiresAt,
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof AuthApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      isLoading: false,
      error: null,
      isHydrated: false,
      setSession: (response) =>
        set({
          session: toSession(response),
          error: null,
        }),
      clearSession: () =>
        set({
          session: null,
          error: null,
        }),
      clearError: () => set({ error: null }),
      register: async (request) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authApi.register(request);
          set({ session: toSession(response), isLoading: false, error: null });
        } catch (error) {
          set({ isLoading: false, error: getErrorMessage(error) });
          throw error;
        }
      },
      login: async (request) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authApi.login(request);
          set({ session: toSession(response), isLoading: false, error: null });
        } catch (error) {
          set({ isLoading: false, error: getErrorMessage(error) });
          throw error;
        }
      },
      googleOAuth: async (request) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authApi.googleOAuth(request);
          set({ session: toSession(response), isLoading: false, error: null });
        } catch (error) {
          set({ isLoading: false, error: getErrorMessage(error) });
          throw error;
        }
      },
      refreshSession: async () => {
        const refreshToken = get().session?.refreshToken;

        if (!refreshToken) {
          set({ session: null });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await authApi.refresh({ refreshToken });
          set({ session: toSession(response), isLoading: false, error: null });
        } catch (error) {
          set({
            session: null,
            isLoading: false,
            error: getErrorMessage(error),
          });
          throw error;
        }
      },
      logout: async () => {
        const refreshToken = get().session?.refreshToken;

        set({ isLoading: true, error: null });

        try {
          if (refreshToken) {
            await authApi.logout({ refreshToken });
          }
        } catch (error) {
          set({ isLoading: false, error: getErrorMessage(error) });
          throw error;
        }

        set({ session: null, isLoading: false, error: null });
      },
      markHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: storageKey,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ session: state.session }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);

