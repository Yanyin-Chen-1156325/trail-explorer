import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  LoaderCircle,
  Mail,
  RefreshCw,
  UserCog,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { usersApiBaseUrl } from "@/config/api";
import {
  getHttpErrorStatus,
  runAuthenticatedRequest,
  useAuthStore,
} from "@/features/auth";

import { createUserApi } from "../services/userApi";
import type { UserResponse, UserRole, UserStatus } from "../types/user";

const userApi = createUserApi(usersApiBaseUrl);
const userRoles: UserRole[] = ["User", "Moderator", "Admin"];
const userStatuses: UserStatus[] = ["Active", "Suspended", "Deleted"];

interface PendingRoleChange {
  role: UserRole;
  user: UserResponse;
}

interface PendingStatusChange {
  status: UserStatus;
  user: UserResponse;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function roleClassName(role: UserResponse["role"]) {
  if (role === "Admin") {
    return "border-[#F59E0B]/35 bg-[#FEF3C7] text-[#92400E] dark:bg-[#F59E0B]/10 dark:text-[#FCD34D]";
  }

  if (role === "Moderator") {
    return "border-[#8B5CF6]/35 bg-[#F3E8FF] text-[#6D28D9] dark:bg-[#8B5CF6]/10 dark:text-[#C4B5FD]";
  }

  return "border-[#10B981]/35 bg-[#ECFDF5] text-[#047857] dark:bg-[#10B981]/10 dark:text-[#A7F3D0]";
}

function statusClassName(status: UserResponse["status"]) {
  if (status === "Suspended" || status === "Deleted") {
    return "border-[#EF4444]/35 bg-[#FEE2E2] text-[#991B1B] dark:bg-[#EF4444]/10 dark:text-red-200";
  }

  return "border-[#10B981]/35 bg-[#ECFDF5] text-[#047857] dark:bg-[#10B981]/10 dark:text-[#A7F3D0]";
}

function UserManagementPage() {
  const session = useAuthStore((state) => state.session);
  const accessToken = session?.accessToken;
  const currentUserId = session?.user.userId;
  const currentUserRole = session?.user.role;
  const canUpdateRoles = currentUserRole === "Admin";
  const canUpdateStatuses =
    currentUserRole === "Admin" || currentUserRole === "Moderator";
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [pendingRoleChange, setPendingRoleChange] =
    useState<PendingRoleChange | null>(null);
  const [pendingStatusChange, setPendingStatusChange] =
    useState<PendingStatusChange | null>(null);

  const activeUsers = useMemo(
    () => users.filter((user) => user.status === "Active").length,
    [users],
  );

  const adminUsers = useMemo(
    () => users.filter((user) => user.role === "Admin").length,
    [users],
  );

  const loadUsers = useCallback(async () => {
    if (!accessToken) {
      setUsers([]);
      setError("A valid session is required to load users.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const nextUsers = await runAuthenticatedRequest((token) =>
        userApi.getUsers(token),
      );
      setUsers(nextUsers);
    } catch (requestError) {
      if (getHttpErrorStatus(requestError) === 403) {
        setError("You need an admin or moderator account to view the user list.");
      } else if (requestError instanceof Error) {
        setError(requestError.message);
      } else {
        setError("Users could not be loaded.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  const requestRoleChange = useCallback((user: UserResponse, role: UserRole) => {
    if (role === user.role) {
      return;
    }

    setPendingRoleChange({ user, role });
  }, []);

  const cancelRoleChange = useCallback(() => {
    setPendingRoleChange(null);
  }, []);

  const requestStatusChange = useCallback(
    (user: UserResponse, status: UserStatus) => {
      if (status === user.status) {
        return;
      }

      setPendingStatusChange({ user, status });
    },
    [],
  );

  const cancelStatusChange = useCallback(() => {
    setPendingStatusChange(null);
  }, []);

  const getAvailableStatusOptions = useCallback(
    (user: UserResponse): UserStatus[] => {
      if (currentUserRole === "Admin") {
        return userStatuses;
      }

      if (
        currentUserRole === "Moderator" &&
        user.role === "User" &&
        user.status === "Active"
      ) {
        return ["Active", "Suspended"];
      }

      return [];
    },
    [currentUserRole],
  );

  const confirmRoleChange = useCallback(async () => {
    if (!pendingRoleChange) {
      return;
    }

    const { user, role } = pendingRoleChange;

    if (role === user.role) {
      setPendingRoleChange(null);
      return;
    }

    if (!accessToken) {
      setError("A valid session is required to update user roles.");
      setPendingRoleChange(null);
      return;
    }

    setUpdatingUserId(user.id);
    setError(null);
    setSuccessMessage(null);

    try {
      const updatedUser = await runAuthenticatedRequest((token) =>
        userApi.updateUserRole(token, user.id, {
          role,
        }),
      );

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === updatedUser.id ? updatedUser : currentUser,
        ),
      );
      setSuccessMessage(`${updatedUser.displayName} is now ${updatedUser.role}.`);
      setPendingRoleChange(null);
    } catch (requestError) {
      if (getHttpErrorStatus(requestError) === 403) {
        setError("You need an admin account to change user roles.");
      } else if (requestError instanceof Error) {
        setError(requestError.message);
      } else {
        setError("User role could not be updated.");
      }
    } finally {
      setUpdatingUserId(null);
    }
  }, [accessToken, pendingRoleChange]);

  const confirmStatusChange = useCallback(async () => {
    if (!pendingStatusChange) {
      return;
    }

    const { user, status } = pendingStatusChange;

    if (status === user.status) {
      setPendingStatusChange(null);
      return;
    }

    if (!accessToken) {
      setError("A valid session is required to update user statuses.");
      setPendingStatusChange(null);
      return;
    }

    setUpdatingUserId(user.id);
    setError(null);
    setSuccessMessage(null);

    try {
      const updatedUser = await runAuthenticatedRequest((token) =>
        userApi.updateUserStatus(token, user.id, {
          status,
        }),
      );

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === updatedUser.id ? updatedUser : currentUser,
        ),
      );
      setSuccessMessage(
        `${updatedUser.displayName} is now ${updatedUser.status}.`,
      );
      setPendingStatusChange(null);
    } catch (requestError) {
      if (getHttpErrorStatus(requestError) === 403) {
        setError("You need an admin or moderator account to change user statuses.");
      } else if (requestError instanceof Error) {
        setError(requestError.message);
      } else {
        setError("User status could not be updated.");
      }
    } finally {
      setUpdatingUserId(null);
    }
  }, [accessToken, pendingStatusChange]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadUsers();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [accessToken, loadUsers]);

  return (
    <main className="theme-page min-h-screen bg-[#0F172A] px-4 py-6 text-[#F8FAFC] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl items-center">
        <section className="w-full space-y-6">
          <Card className="border-white/10 bg-[#1E293B] text-[#F8FAFC] shadow-2xl shadow-black/25">
            <CardContent className="p-6 sm:p-8 lg:p-10">
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div className="space-y-5">
                  <div className="flex size-14 items-center justify-center rounded-xl bg-[#10B981]/15 text-[#10B981]">
                    <UserCog aria-hidden="true" className="size-8" />
                  </div>

                  <div className="max-w-2xl space-y-4">
                    <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                      User Management
                    </h1>
                    <p className="text-base leading-7 text-[#94A3B8] sm:text-lg">
                      Review registered Trail Explorer accounts and prepare
                      admin-only role management.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-[#0F172A] p-5">
                    <Users
                      aria-hidden="true"
                      className="mb-3 size-5 text-[#10B981]"
                    />
                    <p className="text-3xl font-black">{users.length}</p>
                    <p className="mt-1 text-sm text-[#94A3B8]">Total users</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#0F172A] p-5">
                    <UserCog
                      aria-hidden="true"
                      className="mb-3 size-5 text-[#F59E0B]"
                    />
                    <p className="text-3xl font-black">{adminUsers}</p>
                    <p className="mt-1 text-sm text-[#94A3B8]">Admins</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#0F172A] p-5">
                    <Users
                      aria-hidden="true"
                      className="mb-3 size-5 text-[#A7F3D0]"
                    />
                    <p className="text-3xl font-black">{activeUsers}</p>
                    <p className="mt-1 text-sm text-[#94A3B8]">Active</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[#1E293B] text-[#F8FAFC] shadow-xl shadow-black/20">
            <CardContent className="p-0">
              <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-black">Users</h2>
                  <p className="mt-1 text-sm text-[#94A3B8]">
                    Account records returned by the admin users API.
                  </p>
                </div>

                <Button
                  className="w-fit border-white/15 bg-white/5 text-[#F8FAFC] hover:bg-white/10"
                  disabled={isLoading}
                  type="button"
                  variant="outline"
                  onClick={() => void loadUsers()}
                >
                  <RefreshCw
                    aria-hidden="true"
                    className={isLoading ? "size-4 animate-spin" : "size-4"}
                  />
                  Refresh
                </Button>
              </div>

              {isLoading ? (
                <div className="flex min-h-64 items-center justify-center p-8">
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0F172A] px-5 py-4 text-sm text-[#94A3B8]">
                    <LoaderCircle
                      aria-hidden="true"
                      className="size-5 animate-spin text-[#10B981]"
                    />
                    Loading users
                  </div>
                </div>
              ) : null}

              {!isLoading && successMessage ? (
                <div className="px-5 pt-5">
                  <div className="rounded-xl border border-[#10B981]/30 bg-[#10B981]/10 p-4">
                    <div className="flex gap-3">
                      <CheckCircle2
                        aria-hidden="true"
                        className="mt-0.5 size-5 shrink-0 text-[#A7F3D0]"
                      />
                      <p className="text-sm font-medium text-[#A7F3D0]">
                        {successMessage}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {!isLoading && error ? (
                <div className="p-5">
                  <div className="rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 p-5">
                    <div className="flex gap-3">
                      <AlertTriangle
                        aria-hidden="true"
                        className="mt-0.5 size-5 shrink-0 text-red-200"
                      />
                      <div>
                        <h3 className="font-bold text-red-100">
                          Unable to load users
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-red-100/75">
                          {error}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {!isLoading && !error && users.length === 0 ? (
                <div className="p-5">
                  <div className="rounded-xl border border-white/10 bg-[#0F172A] p-8 text-center">
                    <Users
                      aria-hidden="true"
                      className="mx-auto mb-4 size-8 text-[#10B981]"
                    />
                    <h3 className="text-lg font-bold">No users found</h3>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#94A3B8]">
                      Registered accounts will appear here after the admin API
                      returns user records.
                    </p>
                  </div>
                </div>
              ) : null}

              {!isLoading && !error && users.length > 0 ? (
                <>
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-190 text-left text-sm">
                      <thead className="border-b border-black/10 bg-[#F7F8F3] text-xs uppercase tracking-wide text-[#56655D] dark:border-white/10 dark:bg-[#0F172A]/70 dark:text-[#94A3B8]">
                        <tr>
                          <th className="px-5 py-4 font-semibold">User</th>
                          <th className="px-5 py-4 font-semibold">Role</th>
                          <th className="px-5 py-4 font-semibold">Status</th>
                          <th className="px-5 py-4 font-semibold">Provider</th>
                          <th className="px-5 py-4 font-semibold">Created</th>
                          <th className="px-5 py-4 font-semibold">Change Status</th>
                          <th className="px-5 py-4 font-semibold">Change Role</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {users.map((user) => (
                          <tr className="transition hover:bg-white/5" key={user.id}>
                            <td className="px-5 py-4">
                              <p className="font-semibold text-[#F8FAFC]">
                                {user.displayName}
                              </p>
                              <p className="mt-1 text-[#94A3B8]">{user.email}</p>
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${roleClassName(
                                  user.role,
                                )}`}
                              >
                                {user.role}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusClassName(
                                  user.status,
                                )}`}
                              >
                                {user.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-[#D7DEE8]">
                              {user.authProvider}
                            </td>
                            <td className="px-5 py-4 text-[#D7DEE8]">
                              {formatDate(user.createdAt)}
                            </td>
                            <td className="px-5 py-4">
                              {user.id === currentUserId ? (
                                <span className="text-[#94A3B8]">Current user</span>
                              ) : getAvailableStatusOptions(user).length > 0 ? (
                                <>
                                  <label
                                    className="sr-only"
                                    htmlFor={`status-${user.id}`}
                                  >
                                    Change status for {user.displayName}
                                  </label>
                                  <select
                                    className="h-9 rounded-lg border border-white/10 bg-[#0F172A] px-3 text-sm font-semibold text-[#F8FAFC] outline-none transition focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/25 disabled:cursor-not-allowed disabled:opacity-60"
                                    disabled={updatingUserId === user.id}
                                    id={`status-${user.id}`}
                                    value={user.status}
                                    onChange={(event) =>
                                      requestStatusChange(
                                        user,
                                        event.target.value as UserStatus,
                                      )
                                    }
                                  >
                                    {getAvailableStatusOptions(user).map((status) => (
                                      <option key={status} value={status}>
                                        {status}
                                      </option>
                                    ))}
                                  </select>
                                </>
                              ) : (
                                <span className="text-[#94A3B8]">
                                  {canUpdateStatuses ? "No action" : "Admin only"}
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              {user.id === currentUserId ? (
                                <span className="text-[#94A3B8]">Current user</span>
                              ) : canUpdateRoles ? (
                                <>
                                  <label
                                    className="sr-only"
                                    htmlFor={`role-${user.id}`}
                                  >
                                    Change role for {user.displayName}
                                  </label>
                                  <select
                                    className="h-9 rounded-lg border border-white/10 bg-[#0F172A] px-3 text-sm font-semibold text-[#F8FAFC] outline-none transition focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/25 disabled:cursor-not-allowed disabled:opacity-60"
                                    disabled={updatingUserId === user.id}
                                    id={`role-${user.id}`}
                                    value={user.role}
                                    onChange={(event) =>
                                      requestRoleChange(
                                        user,
                                        event.target.value as UserRole,
                                      )
                                    }
                                  >
                                    {userRoles.map((role) => (
                                      <option key={role} value={role}>
                                        {role}
                                      </option>
                                    ))}
                                  </select>
                                </>
                              ) : (
                                <span className="text-[#94A3B8]">Admin only</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid gap-3 p-5 md:hidden">
                    {users.map((user) => (
                      <div
                        className="rounded-xl border border-white/10 bg-[#0F172A] p-4"
                        key={user.id}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold">{user.displayName}</h3>
                            <p className="mt-1 flex items-center gap-2 break-all text-sm text-[#94A3B8]">
                              <Mail aria-hidden="true" className="size-4" />
                              {user.email}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${roleClassName(
                              user.role,
                            )}`}
                          >
                            {user.role}
                          </span>
                        </div>

                        <div className="mt-4 grid gap-3 text-sm">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[#94A3B8]">Status</span>
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClassName(
                                user.status,
                              )}`}
                            >
                              {user.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[#94A3B8]">Provider</span>
                            <span>{user.authProvider}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="flex items-center gap-2 text-[#94A3B8]">
                              <Calendar aria-hidden="true" className="size-4" />
                              Created
                            </span>
                            <span>{formatDate(user.createdAt)}</span>
                          </div>
                          {user.id === currentUserId ? (
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-[#94A3B8]">Change Status</span>
                              <span>Current user</span>
                            </div>
                          ) : getAvailableStatusOptions(user).length > 0 ? (
                            <label className="grid gap-2">
                              <span className="text-[#94A3B8]">Change Status</span>
                              <select
                                className="h-10 rounded-lg border border-white/10 bg-[#071511] px-3 text-sm font-semibold text-[#F8FAFC] outline-none transition focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/25 disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={updatingUserId === user.id}
                                value={user.status}
                                onChange={(event) =>
                                  requestStatusChange(
                                    user,
                                    event.target.value as UserStatus,
                                  )
                                }
                              >
                                {getAvailableStatusOptions(user).map((status) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>
                            </label>
                          ) : (
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-[#94A3B8]">Change Status</span>
                              <span>{canUpdateStatuses ? "No action" : "Admin only"}</span>
                            </div>
                          )}
                          {user.id === currentUserId ? (
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-[#94A3B8]">Change Role</span>
                              <span>Current user</span>
                            </div>
                          ) : canUpdateRoles ? (
                            <label className="grid gap-2">
                              <span className="text-[#94A3B8]">Change Role</span>
                              <select
                                className="h-10 rounded-lg border border-white/10 bg-[#071511] px-3 text-sm font-semibold text-[#F8FAFC] outline-none transition focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/25 disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={updatingUserId === user.id}
                                value={user.role}
                                onChange={(event) =>
                                  requestRoleChange(
                                    user,
                                    event.target.value as UserRole,
                                  )
                                }
                              >
                                {userRoles.map((role) => (
                                  <option key={role} value={role}>
                                    {role}
                                  </option>
                                ))}
                              </select>
                            </label>
                          ) : (
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-[#94A3B8]">Change Role</span>
                              <span>Admin only</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        </section>
      </div>
      <ConfirmationDialog
        cancelLabel="Keep current role"
        confirmLabel="Change role"
        description={
          pendingRoleChange
            ? `This will change ${pendingRoleChange.user.displayName} (${pendingRoleChange.user.email}) from ${pendingRoleChange.user.role} to ${pendingRoleChange.role}.`
            : ""
        }
        isOpen={Boolean(pendingRoleChange)}
        isProcessing={Boolean(
          pendingRoleChange && updatingUserId === pendingRoleChange.user.id,
        )}
        title="Confirm role change"
        onCancel={cancelRoleChange}
        onConfirm={() => void confirmRoleChange()}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            cancelRoleChange();
          }
        }}
      />
      <ConfirmationDialog
        cancelLabel="Keep current status"
        confirmLabel="Change status"
        description={
          pendingStatusChange
            ? `This will change ${pendingStatusChange.user.displayName} (${pendingStatusChange.user.email}) from ${pendingStatusChange.user.status} to ${pendingStatusChange.status}.`
            : ""
        }
        isOpen={Boolean(pendingStatusChange)}
        isProcessing={Boolean(
          pendingStatusChange && updatingUserId === pendingStatusChange.user.id,
        )}
        title="Confirm status change"
        onCancel={cancelStatusChange}
        onConfirm={() => void confirmStatusChange()}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            cancelStatusChange();
          }
        }}
      />
    </main>
  );
}

export { UserManagementPage };
