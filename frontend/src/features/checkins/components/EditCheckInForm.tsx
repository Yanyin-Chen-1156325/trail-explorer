import { useState } from "react";
import type { FormEvent } from "react";
import { CheckCircle2, Loader2, Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { CheckInResponse, UpdateCheckInRequest } from "../types/checkIn";

interface EditCheckInFormProps {
  checkIn: CheckInResponse;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (request: UpdateCheckInRequest) => Promise<void>;
}

type FeedbackState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

function toDateInputValue(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function toCompletedDate(value: string) {
  return new Date(`${value}T12:00:00`).toISOString();
}

function getTodayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function EditCheckInForm({
  checkIn,
  isSaving,
  onCancel,
  onSave,
}: EditCheckInFormProps) {
  const [completedDate, setCompletedDate] = useState(() =>
    toDateInputValue(checkIn.completedDate),
  );
  const [notes, setNotes] = useState(checkIn.notes ?? "");
  const [feedback, setFeedback] = useState<FeedbackState>({ status: "idle" });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback({ status: "idle" });

    try {
      await onSave({
        completedDate: toCompletedDate(completedDate),
        notes: notes.trim() || undefined,
      });

      setFeedback({
        status: "success",
        message: "Check-in updated.",
      });
    } catch (error) {
      setFeedback({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to update this check-in.",
      });
    }
  };

  return (
    <form
      className="mt-5 grid gap-4 rounded-lg border border-emerald-300/20 bg-emerald-400/8 p-4"
      onSubmit={handleSubmit}
    >
      <label className="block space-y-2">
        <span className="text-xs font-semibold text-white/70">
          Completion date
        </span>
        <Input
          required
          className="border-white/10 bg-black/20 text-white [color-scheme:dark]"
          max={getTodayInputValue()}
          type="date"
          value={completedDate}
          onChange={(event) => setCompletedDate(event.target.value)}
        />
      </label>

      <label className="block space-y-2">
        <span className="text-xs font-semibold text-white/70">Notes</span>
        <textarea
          className="min-h-24 w-full resize-y rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/35 focus-visible:border-[#10B981] focus-visible:ring-3 focus-visible:ring-[#10B981]/30"
          maxLength={2000}
          placeholder="How was the trail?"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </label>

      {feedback.status === "error" ? (
        <p className="rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm text-red-100">
          {feedback.message}
        </p>
      ) : null}

      {feedback.status === "success" ? (
        <p className="flex items-center gap-2 rounded-lg border border-emerald-300/25 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100">
          <CheckCircle2 aria-hidden="true" className="size-4" />
          {feedback.message}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          className="border-white/15 bg-white/5 text-white hover:bg-white/10"
          disabled={isSaving}
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          <X aria-hidden="true" className="size-4" />
          Cancel
        </Button>
        <Button
          className="bg-[#10B981] text-[#052E1A] hover:bg-[#34D399]"
          disabled={isSaving}
          type="submit"
        >
          {isSaving ? (
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <Save aria-hidden="true" className="size-4" />
          )}
          Save changes
        </Button>
      </div>
    </form>
  );
}

export { EditCheckInForm };
