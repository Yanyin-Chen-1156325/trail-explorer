import { describe, expect, it } from "vitest";

import { normalizeNotificationType } from "./notificationMapping";

describe("normalizeNotificationType", () => {
  it("maps XP adjustment enum values from the API", () => {
    expect(normalizeNotificationType(4)).toBe("XpDeducted");
    expect(normalizeNotificationType(5)).toBe("XpRegained");
  });
});
