import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { checkInsApiBaseUrl } from "@/config/api";
import { runAuthenticatedRequest, useAuthStore } from "@/features/auth";

import { CheckInApiError, createCheckInApi } from "../services/checkInApi";

interface CheckInFormProps {
  trailId: string;
}

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

function getTodayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function toCompletedDate(value: string) {
  return new Date(`${value}T12:00:00`).toISOString();
}

function CheckInForm({ trailId }: CheckInFormProps) {
  const navigate = useNavigate();
  const session = useAuthStore((state) => state.session);
  const [completedDate, setCompletedDate] = useState(getTodayInputValue);
  const [notes, setNotes] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
  });
  const checkInApi = useMemo(
    () => createCheckInApi(checkInsApiBaseUrl),
    [],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session?.accessToken) {
      setSubmitState({
        status: "error",
        message: "Sign in again before recording this completion.",
      });
      return;
    }

    setSubmitState({ status: "submitting" });

    try {
      await runAuthenticatedRequest((accessToken) =>
        checkInApi.createCheckIn(accessToken, {
          trailId,
          completedDate: toCompletedDate(completedDate),
          notes: notes.trim() || undefined,
        }),
      );

      setSubmitState({
        status: "success",
        message: "Trail completion recorded.",
      });
      setNotes("");
      navigate("/checkins");
    } catch (error) {
      setSubmitState({
        status: "error",
        message:
          error instanceof CheckInApiError
            ? error.message
            : "Unable to record this completion.",
      });
    }
  };

  return (
    <Card className="border-emerald-200 bg-white text-[#0B1511] shadow-xl shadow-black/10 dark:border-emerald-300/20 dark:bg-[#0B1F1A] dark:text-white dark:shadow-black/20">
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-[#10B981]/15 text-[#86EFAC]">
            <CalendarCheck aria-hidden="true" className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold">Check in</h2>
            <p className="text-xs text-[#56655D] dark:text-[#94A3B8]">
              Record this trail completion
            </p>
          </div>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-xs font-semibold text-[#34463C] dark:text-white/70">
              Completion date
            </span>
            <Input
              required
              className="border-black/10 bg-[#F7F8F3] text-[#0B1511] [color-scheme:light] dark:border-white/10 dark:bg-black/20 dark:text-white dark:[color-scheme:dark]"
              max={getTodayInputValue()}
              type="date"
              value={completedDate}
              onChange={(event) => setCompletedDate(event.target.value)}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-semibold text-[#34463C] dark:text-white/70">
              Notes
            </span>
            <textarea
              className="min-h-24 w-full resize-y rounded-lg border border-black/10 bg-[#F7F8F3] px-3 py-2 text-sm text-[#0B1511] outline-none transition placeholder:text-[#56655D]/70 focus-visible:border-[#10B981] focus-visible:ring-3 focus-visible:ring-[#10B981]/30 dark:border-white/10 dark:bg-black/20 dark:text-white dark:placeholder:text-white/35"
              maxLength={2000}
              placeholder="How was the trail?"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </label>

          {submitState.status === "error" ? (
            <p className="rounded-lg border border-red-400/35 bg-[#FEF2F2] px-3 py-2 text-sm font-semibold text-[#991B1B] dark:border-red-400/25 dark:bg-red-500/10 dark:text-red-100">
              {submitState.message}
            </p>
          ) : null}

          {submitState.status === "success" ? (
            <p className="flex items-center gap-2 rounded-lg border border-emerald-300/35 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-300/25 dark:bg-emerald-400/10 dark:text-emerald-100">
              <CheckCircle2 aria-hidden="true" className="size-4" />
              {submitState.message}
            </p>
          ) : null}

          <Button
            className="w-full bg-[#10B981] text-[#052E23] hover:bg-[#34D399]"
            disabled={submitState.status === "submitting"}
            type="submit"
          >
            {submitState.status === "submitting" ? (
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <CalendarCheck aria-hidden="true" className="size-4" />
            )}
            Record completion
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export { CheckInForm };
