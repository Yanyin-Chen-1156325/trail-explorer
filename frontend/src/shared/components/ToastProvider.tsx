import { useEffect } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  type ToastMessage,
  useToastStore,
} from "@/shared/store/toastStore";

const toastStyles: Record<ToastMessage["variant"], string> = {
  error: "border-red-300/30 bg-red-950/95 text-red-50 shadow-red-950/30",
  info: "border-sky-300/30 bg-slate-950/95 text-sky-50 shadow-slate-950/30",
  success:
    "border-emerald-300/30 bg-emerald-950/95 text-emerald-50 shadow-emerald-950/30",
};

const toastIcons = {
  error: AlertCircle,
  info: Info,
  success: CheckCircle2,
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  const Icon = toastIcons[toast.variant];

  useEffect(() => {
    if (toast.durationMs <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      onDismiss(toast.id);
    }, toast.durationMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [onDismiss, toast.durationMs, toast.id]);

  return (
    <li
      className={`grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3 rounded-lg border p-4 shadow-2xl backdrop-blur ${toastStyles[toast.variant]}`}
      role={toast.variant === "error" ? "alert" : "status"}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-bold">{toast.title}</p>
        {toast.description ? (
          <p className="mt-1 text-sm leading-5 text-white/75">
            {toast.description}
          </p>
        ) : null}
      </div>
      <Button
        aria-label={`Dismiss ${toast.title}`}
        className="size-8 border-white/15 bg-white/5 text-white hover:bg-white/10"
        size="icon"
        type="button"
        variant="outline"
        onClick={() => onDismiss(toast.id)}
      >
        <X aria-hidden="true" className="size-4" />
      </Button>
    </li>
  );
}

function ToastProvider() {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <ol
      aria-live="polite"
      aria-label="Notifications"
      className="fixed right-4 top-24 z-50 grid w-[min(calc(100vw-2rem),24rem)] gap-3"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={dismissToast}
        />
      ))}
    </ol>
  );
}

export { ToastProvider };
