import { useAuthStore } from "../store/authStore";

interface HttpStatusError {
  status: number;
}

function getHttpErrorStatus(error: unknown): number | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as HttpStatusError).status === "number"
  ) {
    return (error as HttpStatusError).status;
  }

  return undefined;
}

async function runAuthenticatedRequest<TResponse>(
  request: (accessToken: string) => Promise<TResponse>,
): Promise<TResponse> {
  const firstAccessToken = useAuthStore.getState().session?.accessToken;

  if (!firstAccessToken) {
    throw new Error("A valid session is required.");
  }

  try {
    return await request(firstAccessToken);
  } catch (error) {
    if (getHttpErrorStatus(error) !== 401) {
      throw error;
    }

    try {
      await useAuthStore.getState().refreshSession();
    } catch {
      throw error;
    }

    const refreshedAccessToken = useAuthStore.getState().session?.accessToken;

    if (!refreshedAccessToken) {
      throw error;
    }

    try {
      return await request(refreshedAccessToken);
    } catch (retryError) {
      if (getHttpErrorStatus(retryError) === 401) {
        useAuthStore.getState().clearSession();
      }

      throw retryError;
    }
  }
}

export { getHttpErrorStatus, runAuthenticatedRequest };
