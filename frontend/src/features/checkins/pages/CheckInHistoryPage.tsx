import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  Edit3,
  Loader2,
  MapPin,
  RouteIcon,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { checkInsApiBaseUrl } from "@/config/api";
import { runAuthenticatedRequest, useAuthStore } from "@/features/auth";

import { EditCheckInForm } from "../components/EditCheckInForm";
import { CheckInApiError, createCheckInApi } from "../services/checkInApi";
import type { CheckInResponse, UpdateCheckInRequest } from "../types/checkIn";

type LoadState =
  | { status: "loading" }
  | { status: "success"; checkIns: CheckInResponse[] }
  | { status: "empty" }
  | { status: "error"; message: string };

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value));
}

function CheckInHistoryPage() {
  const session = useAuthStore((state) => state.session);
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [editingCheckInId, setEditingCheckInId] = useState<string | null>(null);
  const [savingCheckInId, setSavingCheckInId] = useState<string | null>(null);
  const [deleteCheckInId, setDeleteCheckInId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const checkInApi = useMemo(
    () => createCheckInApi(checkInsApiBaseUrl),
    [],
  );

  const updateCheckInInState = (updatedCheckIn: CheckInResponse) => {
    setLoadState((current) => {
      if (current.status !== "success") {
        return current;
      }

      return {
        status: "success",
        checkIns: current.checkIns.map((checkIn) =>
          checkIn.id === updatedCheckIn.id ? updatedCheckIn : checkIn,
        ),
      };
    });
  };

  const handleSaveCheckIn = async (
    checkInId: string,
    request: UpdateCheckInRequest,
  ) => {
    if (!session?.accessToken) {
      throw new Error("Sign in again before editing this check-in.");
    }

    setSavingCheckInId(checkInId);

    try {
      const updatedCheckIn = await runAuthenticatedRequest((accessToken) =>
        checkInApi.updateCheckIn(
          accessToken,
          checkInId,
          request,
        ),
      );

      updateCheckInInState(updatedCheckIn);
      setEditingCheckInId(null);
    } catch (error) {
      throw error instanceof CheckInApiError
        ? new Error(error.message)
        : error;
    } finally {
      setSavingCheckInId(null);
    }
  };

  const removeCheckInFromState = (checkInId: string) => {
    setLoadState((current) => {
      if (current.status !== "success") {
        return current;
      }

      const remainingCheckIns = current.checkIns.filter(
        (checkIn) => checkIn.id !== checkInId,
      );

      return remainingCheckIns.length > 0
        ? { status: "success", checkIns: remainingCheckIns }
        : { status: "empty" };
    });
  };

  const selectedDeleteCheckIn =
    loadState.status === "success" && deleteCheckInId
      ? loadState.checkIns.find((checkIn) => checkIn.id === deleteCheckInId)
      : undefined;

  const handleDeleteCheckIn = async () => {
    if (!deleteCheckInId) {
      return;
    }

    if (!session?.accessToken) {
      setDeleteError("Sign in again before deleting this check-in.");
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);
    setDeleteMessage(null);

    try {
      await runAuthenticatedRequest((accessToken) =>
        checkInApi.deleteCheckIn(accessToken, deleteCheckInId),
      );
      removeCheckInFromState(deleteCheckInId);
      setDeleteCheckInId(null);
      setDeleteMessage("Check-in deleted.");
      if (editingCheckInId === deleteCheckInId) {
        setEditingCheckInId(null);
      }
    } catch (error) {
      setDeleteError(
        error instanceof CheckInApiError
          ? error.message
          : "Unable to delete this check-in.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (!session?.accessToken) {
      setLoadState({
        status: "error",
        message: "Sign in again to view your check-ins.",
      });
      return;
    }

    let isCurrent = true;

    const loadCheckIns = async () => {
      setLoadState({ status: "loading" });

      try {
        const checkIns = await runAuthenticatedRequest((accessToken) =>
          checkInApi.getMyCheckInHistory(accessToken),
        );

        if (!isCurrent) {
          return;
        }

        setLoadState(
          checkIns.length > 0
            ? { status: "success", checkIns }
            : { status: "empty" },
        );
      } catch (error) {
        if (!isCurrent) {
          return;
        }

        setLoadState({
          status: "error",
          message:
            error instanceof CheckInApiError
              ? error.message
              : "Unable to load your check-ins.",
        });
      }
    };

    void loadCheckIns();

    return () => {
      isCurrent = false;
    };
  }, [checkInApi, session?.accessToken]);

  return (
    <main className="min-h-screen bg-[#0F172A] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold uppercase text-[#86EFAC]">
              <CalendarCheck aria-hidden="true" className="size-4" />
              Check-ins
            </p>
            <h1 className="mt-3 text-3xl font-black sm:text-4xl">
              Trail completion history
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#94A3B8] sm:text-base">
              Review the trails you have completed and revisit notes from each
              recorded hike.
            </p>
          </div>

          <Button
            asChild
            className="border-white/15 bg-white/5 text-white hover:bg-white/10"
            variant="outline"
          >
            <Link to="/trails">
              <RouteIcon aria-hidden="true" className="size-4" />
              Explore trails
            </Link>
          </Button>
        </section>

        {loadState.status === "loading" ? (
          <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-white/10 bg-[#071511] text-[#94A3B8]">
            <Loader2 aria-hidden="true" className="mr-2 size-5 animate-spin" />
            Loading check-ins
          </div>
        ) : null}

        {loadState.status === "error" ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-red-400/25 bg-red-500/10 p-8 text-center">
            <AlertCircle aria-hidden="true" className="size-10 text-red-300" />
            <h2 className="mt-4 text-lg font-bold">Check-ins unavailable</h2>
            <p className="mt-2 max-w-md text-sm text-red-100/75">
              {loadState.message}
            </p>
          </div>
        ) : null}

        {loadState.status === "empty" ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-white/10 bg-[#071511] p-8 text-center">
            <MapPin aria-hidden="true" className="size-10 text-[#86EFAC]" />
            <h2 className="mt-4 text-lg font-bold">No check-ins yet</h2>
            <p className="mt-2 max-w-md text-sm text-[#94A3B8]">
              Complete a trail from the trail detail page to start building your
              history.
            </p>
            <Button
              asChild
              className="mt-5 bg-[#10B981] text-[#052E1A] hover:bg-[#34D399]"
            >
              <Link to="/trails">Find a trail</Link>
            </Button>
          </div>
        ) : null}

        {loadState.status === "success" ? (
          <section className="grid gap-4" aria-label="Check-in history">
            {deleteMessage ? (
              <p className="flex items-center gap-2 rounded-lg border border-emerald-300/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                <CheckCircle2 aria-hidden="true" className="size-4" />
                {deleteMessage}
              </p>
            ) : null}

            {deleteError ? (
              <p className="rounded-lg border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {deleteError}
              </p>
            ) : null}

            {loadState.checkIns.map((checkIn) => (
              <Card
                className="border-white/10 bg-[#071511] text-white shadow-xl shadow-black/20"
                key={checkIn.id}
              >
                <CardContent className="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-100">
                        <CalendarCheck aria-hidden="true" className="size-4" />
                        {formatDate(checkIn.completedDate)}
                      </span>
                      <span className="truncate rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/65">
                        Trail {checkIn.trailId}
                      </span>
                    </div>

                    <p className="mt-4 whitespace-pre-line text-sm leading-6 text-[#CBD5E1]">
                      {checkIn.notes || "No notes recorded for this completion."}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <Button
                      className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                      type="button"
                      variant="outline"
                      onClick={() => setEditingCheckInId(checkIn.id)}
                    >
                      <Edit3 aria-hidden="true" className="size-4" />
                      Edit
                    </Button>

                    <Button
                      className="border-red-300/25 bg-red-500/10 text-red-100 hover:bg-red-500/20"
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setDeleteCheckInId(checkIn.id);
                        setDeleteError(null);
                        setDeleteMessage(null);
                      }}
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                      Delete
                    </Button>

                    <Button
                      asChild
                      className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                      variant="outline"
                    >
                      <Link to={`/trails/${checkIn.trailId}`}>
                        <RouteIcon aria-hidden="true" className="size-4" />
                        Trail
                      </Link>
                    </Button>

                  </div>

                  {editingCheckInId === checkIn.id ? (
                    <div className="md:col-span-2">
                      <EditCheckInForm
                        checkIn={checkIn}
                        isSaving={savingCheckInId === checkIn.id}
                        onCancel={() => setEditingCheckInId(null)}
                        onSave={(request) =>
                          handleSaveCheckIn(checkIn.id, request)
                        }
                      />
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </section>
        ) : null}
      </div>

      <ConfirmationDialog
        confirmLabel="Delete"
        description={`This will permanently remove the check-in from ${selectedDeleteCheckIn ? formatDate(selectedDeleteCheckIn.completedDate) : "your history"}.`}
        isOpen={Boolean(deleteCheckInId)}
        isProcessing={isDeleting}
        processingLabel="Deleting"
        title="Delete check-in?"
        onCancel={() => setDeleteCheckInId(null)}
        onConfirm={handleDeleteCheckIn}
        onOpenChange={(isOpen) => {
          if (!isOpen && !isDeleting) {
            setDeleteCheckInId(null);
          }
        }}
      />
    </main>
  );
}

export { CheckInHistoryPage };
