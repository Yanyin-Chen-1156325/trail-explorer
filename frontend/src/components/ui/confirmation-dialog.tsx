import { AlertTriangle } from "lucide-react";
import { Dialog } from "radix-ui";

import { Button } from "@/components/ui/button";

interface ConfirmationDialogProps {
  cancelLabel?: string;
  confirmLabel?: string;
  description: string;
  isOpen: boolean;
  isProcessing?: boolean;
  processingLabel?: string;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
  onOpenChange: (isOpen: boolean) => void;
}

function ConfirmationDialog({
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
  description,
  isOpen,
  isProcessing = false,
  processingLabel = "Updating",
  title,
  onCancel,
  onConfirm,
  onOpenChange,
}: ConfirmationDialogProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-2000 bg-black/65 backdrop-blur-sm data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-2001 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-white/10 bg-[#10221A] p-6 text-[#F8FAFC] shadow-2xl shadow-black/35 focus:outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#F59E0B]/15 text-[#FCD34D]">
              <AlertTriangle aria-hidden="true" className="size-6" />
            </div>
            <div className="min-w-0 space-y-2">
              <Dialog.Title className="text-xl font-black">{title}</Dialog.Title>
              <Dialog.Description className="text-sm leading-6 text-[#B7C6BD]">
                {description}
              </Dialog.Description>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              className="h-10 border-white/15 bg-white/5 text-[#F8FAFC] hover:bg-white/10"
              disabled={isProcessing}
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              {cancelLabel}
            </Button>
            <Button
              className="h-10 bg-[#F59E0B] px-4 font-bold text-[#1F1300] hover:bg-[#FBBF24]"
              disabled={isProcessing}
              type="button"
              onClick={onConfirm}
            >
              {isProcessing ? processingLabel : confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export { ConfirmationDialog };
