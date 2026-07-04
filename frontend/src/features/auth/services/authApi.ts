import type {
  AuthResponse,
  GoogleOAuthRequest,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
} from "../types/auth";

export class AuthApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
  }
}

export interface AuthApi {
  register(request: RegisterRequest): Promise<AuthResponse>;
  login(request: LoginRequest): Promise<AuthResponse>;
  googleOAuth(request: GoogleOAuthRequest): Promise<AuthResponse>;
  refresh(request: RefreshTokenRequest): Promise<AuthResponse>;
  logout(request: RefreshTokenRequest): Promise<void>;
}

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { message?: string } | null;
    if (payload?.message) {
      return payload.message;
    }
  } catch {
    // Fallback to the generic HTTP status text below.
  }

  return response.statusText || "Request failed";
}

async function requestJson<TResponse>(
  baseUrl: string,
  path: string,
  body: unknown,
): Promise<TResponse> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new AuthApiError(await readErrorMessage(response), response.status);
  }

  return (await response.json()) as TResponse;
}

async function requestNoContent(
  baseUrl: string,
  path: string,
  body: unknown,
): Promise<void> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new AuthApiError(await readErrorMessage(response), response.status);
  }
}

export function createAuthApi(baseUrl: string = "/api/auth"): AuthApi {
  const normalizedBaseUrl = trimTrailingSlash(baseUrl);

  return {
    register(request) {
      return requestJson<AuthResponse>(normalizedBaseUrl, "/register", request);
    },
    login(request) {
      return requestJson<AuthResponse>(normalizedBaseUrl, "/login", request);
    },
    googleOAuth(request) {
      return requestJson<AuthResponse>(normalizedBaseUrl, "/google", request);
    },
    refresh(request) {
      return requestJson<AuthResponse>(normalizedBaseUrl, "/refresh", request);
    },
    logout(request) {
      return requestNoContent(normalizedBaseUrl, "/logout", request);
    },
  };
}
