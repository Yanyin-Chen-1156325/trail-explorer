import type {
  AuthProvider,
  RawEnumValue,
  RawUserResponse,
  UserResponse,
  UserRole,
  UserStatus,
} from "../types/user";

export class UserApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "UserApiError";
    this.status = status;
  }
}

export interface UserApi {
  getUsers(accessToken: string): Promise<UserResponse[]>;
}

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const userRoleLabels: UserRole[] = ["User", "Admin", "Moderator"];
const userStatusLabels: UserStatus[] = ["Active", "Disabled", "Deleted"];
const authProviderLabels: AuthProvider[] = ["Local", "Google"];

function normalizeEnum<TValue extends string>(
  value: RawEnumValue<TValue>,
  labels: TValue[],
): TValue {
  if (typeof value === "string") {
    return value;
  }

  return labels[value] ?? labels[0];
}

function normalizeUser(user: RawUserResponse): UserResponse {
  return {
    ...user,
    role: normalizeEnum(user.role, userRoleLabels),
    status: normalizeEnum(user.status, userStatusLabels),
    authProvider: normalizeEnum(user.authProvider, authProviderLabels),
  };
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { message?: string } | null;
    if (payload?.message) {
      return payload.message;
    }
  } catch {
    // Fall back to the HTTP status text below.
  }

  return response.statusText || "Request failed";
}

async function requestJson<TResponse>(
  baseUrl: string,
  path: string,
  accessToken: string,
): Promise<TResponse> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new UserApiError(await readErrorMessage(response), response.status);
  }

  return (await response.json()) as TResponse;
}

export function createUserApi(baseUrl: string = "/api/users"): UserApi {
  const normalizedBaseUrl = trimTrailingSlash(baseUrl);

  return {
    async getUsers(accessToken) {
      const users = await requestJson<RawUserResponse[]>(
        normalizedBaseUrl,
        "",
        accessToken,
      );

      return users.map(normalizeUser);
    },
  };
}
