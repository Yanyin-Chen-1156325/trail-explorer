import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  CalendarCheck,
  Camera,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  RouteIcon,
  ShieldCheck,
  Undo2,
  UserCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { checkInsApiBaseUrl } from "@/config/api";
import { runAuthenticatedRequest, useAuthStore } from "@/features/auth";

import { CheckInApiError, createCheckInApi } from "../services/checkInApi";
import type { CheckInResponse } from "../types/checkIn";

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

function CheckInModerationPage() {
  const session = useAuthStore((state) => state.session);
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [hideCheckInId, setHideCheckInId] = useState<string | null>(null);
  const [isHiding, setIsHiding] = useState(false);
  const [hideMessage, setHideMessage] = useState<string | null>(null);
  const [hideError, setHideError] = useState<string | null>(null);
  const [restoreCheckInId, setRestoreCheckInId] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const checkInApi = useMemo(
    () => createCheckInApi(checkInsApiBaseUrl),
    [],
  );

  const replaceCheckInInState = (updatedCheckIn: CheckInResponse) => {
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

  const selectedHideCheckIn =
    loadState.status === "success" && hideCheckInId
      ? loadState.checkIns.find((checkIn) => checkIn.id === hideCheckInId)
      : undefined;

  const selectedRestoreCheckIn =
    loadState.status === "success" && restoreCheckInId
      ? loadState.checkIns.find((checkIn) => checkIn.id === restoreCheckInId)
      : undefined;

  const handleHideCheckIn = async () => {
    if (!hideCheckInId) {
      return;
    }

    if (!session?.accessToken) {
      setHideError("Sign in again before hiding this check-in.");
      return;
    }

    setIsHiding(true);
    setHideError(null);
    setHideMessage(null);

    try {
      const updatedCheckIn = await runAuthenticatedRequest((accessToken) =>
        checkInApi.hideCheckIn(accessToken, hideCheckInId),
      );

      replaceCheckInInState(updatedCheckIn);
      setHideCheckInId(null);
      setHideMessage("Check-in hidden.");
      setRestoreMessage(null);
    } catch (error) {
      setHideError(
        error instanceof CheckInApiError
          ? error.message
          : "Unable to hide this check-in.",
      );
    } finally {
      setIsHiding(false);
    }
  };

  const handleRestoreCheckIn = async () => {
    if (!restoreCheckInId) {
      return;
    }

    if (!session?.accessToken) {
      setRestoreError("Sign in again before restoring this check-in.");
      return;
    }

    setIsRestoring(true);
    setRestoreError(null);
    setRestoreMessage(null);

    try {
      const updatedCheckIn = await runAuthenticatedRequest((accessToken) =>
        checkInApi.restoreCheckIn(accessToken, restoreCheckInId),
      );

      replaceCheckInInState(updatedCheckIn);
      setRestoreCheckInId(null);
      setRestoreMessage("Check-in restored.");
      setHideMessage(null);
    } catch (error) {
      setRestoreError(
        error instanceof CheckInApiError
          ? error.message
          : "Unable to restore this check-in.",
      );
    } finally {
      setIsRestoring(false);
    }
  };

  useEffect(() => {
    if (!session?.accessToken) {
      setLoadState({
        status: "error",
        message: "Sign in again to review check-ins.",
      });
      return;
    }

    let isCurrent = true;

    const loadCheckIns = async () => {
      setLoadState({ status: "loading" });

      try {
        const checkIns = await runAuthenticatedRequest((accessToken) =>
          checkInApi.getAllCheckIns(accessToken),
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
              : "Unable to load check-ins for moderation.",
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
              <ShieldCheck aria-hidden="true" className="size-4" />
              Moderation
            </p>
            <h1 className="mt-3 text-3xl font-black sm:text-4xl">
              Check-in moderation
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#94A3B8] sm:text-base">
              Review community check-ins and manage visibility for content that
              needs moderator attention.
            </p>
          </div>

          <Button
            asChild
            className="border-white/15 bg-white/5 text-white hover:bg-white/10"
            variant="outline"
          >
            <Link to="/checkins">My check-ins</Link>
          </Button>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="border-white/10 bg-[#071511] text-white shadow-xl shadow-black/20">
            <CardContent className="p-5">
              <div className="flex size-11 items-center justify-center rounded-lg bg-[#10B981]/15 text-[#86EFAC]">
                <ShieldCheck aria-hidden="true" className="size-6" />
              </div>
              <h2 className="mt-4 text-base font-bold">All check-ins</h2>
              <p className="mt-2 text-sm leading-6 text-[#94A3B8]">
                Review every visible and hidden check-in submitted by users.
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[#071511] text-white shadow-xl shadow-black/20">
            <CardContent className="p-5">
              <div className="flex size-11 items-center justify-center rounded-lg bg-[#F59E0B]/15 text-[#FCD34D]">
                <EyeOff aria-hidden="true" className="size-6" />
              </div>
              <h2 className="mt-4 text-base font-bold">Hide content</h2>
              <p className="mt-2 text-sm leading-6 text-[#94A3B8]">
                Visibility controls will be added after the all check-ins view
                exists.
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[#071511] text-white shadow-xl shadow-black/20">
            <CardContent className="p-5">
              <div className="flex size-11 items-center justify-center rounded-lg bg-[#8B5CF6]/15 text-[#C4B5FD]">
                <Undo2 aria-hidden="true" className="size-6" />
              </div>
              <h2 className="mt-4 text-base font-bold">Restore content</h2>
              <p className="mt-2 text-sm leading-6 text-[#94A3B8]">
                Hidden check-ins can be restored once restore controls are
                implemented.
              </p>
            </CardContent>
          </Card>
        </section>

        <Card className="border-white/10 bg-white/[0.04] text-white">
          <CardContent className="p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold">All check-ins</h2>
                <p className="mt-2 text-sm leading-6 text-[#94A3B8]">
                  Moderator view across all user trail completions.
                </p>
              </div>
              {loadState.status === "success" ? (
                <div className="rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/75">
                  <span className="font-bold text-white">
                    {loadState.checkIns.length}
                  </span>{" "}
                  check-ins
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {loadState.status === "loading" ? (
          <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-white/10 bg-[#071511] text-[#94A3B8]">
            <Loader2 aria-hidden="true" className="mr-2 size-5 animate-spin" />
            Loading check-ins
          </div>
        ) : null}

        {loadState.status === "error" ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-red-400/25 bg-red-500/10 p-8 text-center">
            <AlertCircle aria-hidden="true" className="size-10 text-red-300" />
            <h2 className="mt-4 text-lg font-bold">Moderation unavailable</h2>
            <p className="mt-2 max-w-md text-sm text-red-100/75">
              {loadState.message}
            </p>
          </div>
        ) : null}

        {loadState.status === "empty" ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-white/10 bg-[#071511] p-8 text-center">
            <ShieldCheck aria-hidden="true" className="size-10 text-[#86EFAC]" />
            <h2 className="mt-4 text-lg font-bold">No check-ins to review</h2>
            <p className="mt-2 max-w-md text-sm text-[#94A3B8]">
              User trail completions will appear here after check-ins are
              recorded.
            </p>
          </div>
        ) : null}

        {loadState.status === "success" ? (
          <section className="grid gap-4" aria-label="All check-ins">
            {hideMessage ? (
              <p className="flex items-center gap-2 rounded-lg border border-emerald-300/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                <CheckCircle2 aria-hidden="true" className="size-4" />
                {hideMessage}
              </p>
            ) : null}

            {hideError ? (
              <p className="rounded-lg border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {hideError}
              </p>
            ) : null}

            {restoreMessage ? (
              <p className="flex items-center gap-2 rounded-lg border border-emerald-300/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                <CheckCircle2 aria-hidden="true" className="size-4" />
                {restoreMessage}
              </p>
            ) : null}

            {restoreError ? (
              <p className="rounded-lg border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {restoreError}
              </p>
            ) : null}

            {loadState.checkIns.map((checkIn) => (
              <Card
                className="border-white/10 bg-[#071511] text-white shadow-xl shadow-black/20"
                key={checkIn.id}
              >
                <CardContent className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1 text-xs font-bold ${
                          checkIn.isHidden
                            ? "border-amber-300/25 bg-amber-400/10 text-amber-100"
                            : "border-emerald-300/25 bg-emerald-400/10 text-emerald-100"
                        }`}
                      >
                        {checkIn.isHidden ? (
                          <EyeOff aria-hidden="true" className="size-4" />
                        ) : (
                          <Eye aria-hidden="true" className="size-4" />
                        )}
                        {checkIn.isHidden ? "Hidden" : "Visible"}
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/75">
                        <CalendarCheck aria-hidden="true" className="size-4" />
                        {formatDate(checkIn.completedDate)}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-2 text-xs text-white/60 md:grid-cols-2">
                      <p className="flex min-w-0 items-center gap-2">
                        <UserCircle
                          aria-hidden="true"
                          className="size-4 shrink-0 text-[#86EFAC]"
                        />
                        <span className="truncate">User {checkIn.userId}</span>
                      </p>
                      <p className="flex min-w-0 items-center gap-2">
                        <RouteIcon
                          aria-hidden="true"
                          className="size-4 shrink-0 text-[#86EFAC]"
                        />
                        <span className="truncate">Trail {checkIn.trailId}</span>
                      </p>
                    </div>

                    <p className="mt-4 whitespace-pre-line text-sm leading-6 text-[#CBD5E1]">
                      {checkIn.notes || "No notes recorded for this completion."}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    {!checkIn.isHidden ? (
                      <Button
                        className="border-amber-300/25 bg-amber-400/10 text-amber-100 hover:bg-amber-400/20"
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setHideCheckInId(checkIn.id);
                          setHideError(null);
                          setHideMessage(null);
                          setRestoreError(null);
                          setRestoreMessage(null);
                        }}
                      >
                        <EyeOff aria-hidden="true" className="size-4" />
                        Hide
                      </Button>
                    ) : null}

                    {checkIn.isHidden ? (
                      <Button
                        className="border-violet-300/25 bg-violet-400/10 text-violet-100 hover:bg-violet-400/20"
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setRestoreCheckInId(checkIn.id);
                          setRestoreError(null);
                          setRestoreMessage(null);
                          setHideError(null);
                          setHideMessage(null);
                        }}
                      >
                        <Undo2 aria-hidden="true" className="size-4" />
                        Restore
                      </Button>
                    ) : null}

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

                    {checkIn.photoUrl ? (
                      <Button
                        asChild
                        className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                        variant="outline"
                      >
                        <a
                          href={checkIn.photoUrl}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <Camera aria-hidden="true" className="size-4" />
                          Photo
                          <ExternalLink
                            aria-hidden="true"
                            className="size-3"
                          />
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
        ) : null}
      </div>

      <ConfirmationDialog
        confirmLabel="Hide"
        description={`This will hide the check-in from ${selectedHideCheckIn ? formatDate(selectedHideCheckIn.completedDate) : "the public user history"}.`}
        isOpen={Boolean(hideCheckInId)}
        isProcessing={isHiding}
        processingLabel="Hiding"
        title="Hide check-in?"
        onCancel={() => setHideCheckInId(null)}
        onConfirm={handleHideCheckIn}
        onOpenChange={(isOpen) => {
          if (!isOpen && !isHiding) {
            setHideCheckInId(null);
          }
        }}
      />

      <ConfirmationDialog
        confirmLabel="Restore"
        description={`This will make the check-in from ${selectedRestoreCheckIn ? formatDate(selectedRestoreCheckIn.completedDate) : "the hidden list"} visible again.`}
        isOpen={Boolean(restoreCheckInId)}
        isProcessing={isRestoring}
        processingLabel="Restoring"
        title="Restore check-in?"
        onCancel={() => setRestoreCheckInId(null)}
        onConfirm={handleRestoreCheckIn}
        onOpenChange={(isOpen) => {
          if (!isOpen && !isRestoring) {
            setRestoreCheckInId(null);
          }
        }}
      />
    </main>
  );
}

export { CheckInModerationPage };
