export type UserRole = "User" | "Admin" | "Moderator";

export type UserStatus = "Active" | "Suspended" | "Deleted";

export type AuthProvider = "Local" | "Google";

export interface UserResponse {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  authProvider: AuthProvider;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRoleRequest {
  role: UserRole;
}

export interface UpdateUserStatusRequest {
  status: UserStatus;
}

export type RawEnumValue<TValue extends string> = TValue | number;

export interface RawUserResponse {
  id: string;
  email: string;
  displayName: string;
  role: RawEnumValue<UserRole>;
  status: RawEnumValue<UserStatus>;
  authProvider: RawEnumValue<AuthProvider>;
  createdAt: string;
  updatedAt: string;
}
