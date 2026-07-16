import { create } from "zustand";

export type ToastVariant = "error" | "info" | "success";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  durationMs: number;
}

interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
}

interface ToastState {
  toasts: ToastMessage[];
  showToast: (toast: ToastInput) => string;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
}

let toastId = 0;

function createToastId() {
  toastId += 1;
  return `toast-${toastId}`;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  showToast: (toast) => {
    const id = createToastId();

    set((state) => ({
      toasts: [
        {
          id,
          title: toast.title,
          description: toast.description,
          variant: toast.variant ?? "info",
          durationMs: toast.durationMs ?? 5000,
        },
        ...state.toasts,
      ].slice(0, 5),
    }));

    return id;
  },
  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
  clearToasts: () => {
    set({ toasts: [] });
  },
}));
