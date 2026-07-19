import { Award, X } from "lucide-react";
import { Dialog } from "radix-ui";

import { Button } from "@/components/ui/button";

import type { BadgeResponse } from "../types/badge";

interface BadgeUnlockModalProps {
  badge: BadgeResponse | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

function BadgeUnlockModal({
  badge,
  isOpen,
  onOpenChange,
}: BadgeUnlockModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-2000 bg-black/70 backdrop-blur-sm data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-2001 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-[#C4B5FD]/25 bg-[#101726] p-6 text-white shadow-2xl shadow-black/40 focus:outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <button
            aria-label="Close badge unlock"
            className="absolute right-4 top-4 rounded-lg p-1 text-white/60 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#C4B5FD]/60"
            type="button"
            onClick={() => onOpenChange(false)}
          >
            <X aria-hidden="true" className="size-5" />
          </button>

          <div className="mx-auto flex size-20 items-center justify-center rounded-lg border border-[#C4B5FD]/30 bg-[#8B5CF6]/20 text-[#DDD6FE]">
            <Award aria-hidden="true" className="size-10" />
          </div>

          <Dialog.Title className="mt-5 text-center text-2xl font-black">
            Badge unlocked
          </Dialog.Title>
          <Dialog.Description className="mt-3 text-center text-sm leading-6 text-[#CBD5E1]">
            {badge
              ? `${badge.name}: ${badge.description}`
              : "A new achievement has been added to your badge wall."}
          </Dialog.Description>

          <Button
            className="mt-6 h-10 w-full bg-[#8B5CF6] font-bold text-white hover:bg-[#7C3AED]"
            type="button"
            onClick={() => onOpenChange(false)}
          >
            View badge wall
          </Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export { BadgeUnlockModal };
