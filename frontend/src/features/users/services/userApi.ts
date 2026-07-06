import type {
  AuthProvider,
  RawEnumValue,
  RawUserResponse,
  UpdateUserRoleRequest,
  UpdateUserStatusRequest,
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
  updateUserRole(
    accessToken: string,
    userId: string,
    request: UpdateUserRoleRequest,
  ): Promise<UserResponse>;
  updateUserStatus(
    accessToken: string,
    userId: string,
    request: UpdateUserStatusRequest,
  ): Promise<UserResponse>;
}

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const userRoleLabels: UserRole[] = ["User", "Admin", "Moderator"];
const userStatusLabels: UserStatus[] = ["Active", "Suspended", "Deleted"];
const authProviderLabels: AuthProvider[] = ["Local", "Google"];
const userRoleValues: Record<UserRole, number> = {
  User: 0,
  Admin: 1,
  Moderator: 2,
};
const userStatusValues: Record<UserStatus, number> = {
  Active: 0,
  Suspended: 1,
  Deleted: 2,
};

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
  init?: RequestInit,
): Promise<TResponse> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...init?.headers,
    },
    ...init,
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
    async updateUserRole(accessToken, userId, request) {
      const user = await requestJson<RawUserResponse>(
        normalizedBaseUrl,
        `/${userId}/role`,
        accessToken,
        {
          method: "PUT",
          body: JSON.stringify({ role: userRoleValues[request.role] }),
        },
      );

      return normalizeUser(user);
    },
    async updateUserStatus(accessToken, userId, request) {
      const user = await requestJson<RawUserResponse>(
        normalizedBaseUrl,
        `/${userId}/status`,
        accessToken,
        {
          method: "PUT",
          body: JSON.stringify({ status: userStatusValues[request.status] }),
        },
      );

      return normalizeUser(user);
    },
  };
}
