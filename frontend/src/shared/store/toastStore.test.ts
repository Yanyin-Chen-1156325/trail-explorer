import { beforeEach, describe, expect, it } from "vitest";

import { useToastStore } from "./toastStore";

describe("toastStore", () => {
  beforeEach(() => {
    useToastStore.getState().clearToasts();
  });

  it("adds toast notifications with defaults", () => {
    const id = useToastStore.getState().showToast({ title: "Saved" });

    expect(useToastStore.getState().toasts).toEqual([
      {
        id,
        title: "Saved",
        description: undefined,
        variant: "info",
        durationMs: 5000,
      },
    ]);
  });

  it("dismisses toast notifications", () => {
    const id = useToastStore.getState().showToast({
      title: "Badge unlocked",
      variant: "success",
    });

    useToastStore.getState().dismissToast(id);

    expect(useToastStore.getState().toasts).toHaveLength(0);
  });
});
