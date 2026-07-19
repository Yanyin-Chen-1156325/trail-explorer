import { useEffect, useMemo, useState } from "react";
import { Award } from "lucide-react";

import { badgesApiBaseUrl } from "@/config/api";
import { runAuthenticatedRequest, useAuthStore } from "@/features/auth";

import { BadgeWall } from "../components/BadgeWall";
import { BadgeApiError, createBadgeApi } from "../services/badgeApi";
import type { BadgeResponse } from "../types/badge";

type LoadState =
  | { status: "loading" }
  | { status: "success"; badges: BadgeResponse[] }
  | { status: "error"; message: string };

function BadgeWallPage() {
  const session = useAuthStore((state) => state.session);
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const badgeApi = useMemo(() => createBadgeApi(badgesApiBaseUrl), []);

  const loadBadges = async () => {
    if (!session?.accessToken) {
      setLoadState({
        status: "error",
        message: "Sign in again to view your badges.",
      });
      return;
    }

    setLoadState({ status: "loading" });

    try {
      const badges = await runAuthenticatedRequest((accessToken) =>
        badgeApi.getMyBadges(accessToken),
      );
      setLoadState({ status: "success", badges });
    } catch (error) {
      setLoadState({
        status: "error",
        message:
          error instanceof BadgeApiError
            ? error.message
            : "Unable to load your badges.",
      });
    }
  };

  useEffect(() => {
    let isCurrent = true;

    const loadCurrentBadges = async () => {
      if (!isCurrent) {
        return;
      }

      await loadBadges();
    };

    void loadCurrentBadges();

    return () => {
      isCurrent = false;
    };
    // loadBadges intentionally captures the current session and API instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [badgeApi, session?.accessToken]);

  return (
    <main className="theme-page min-h-screen bg-[#0F172A] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section>
          <p className="flex items-center gap-2 text-sm font-bold uppercase text-[#C4B5FD]">
            <Award aria-hidden="true" className="size-4" />
            Achievements
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">Badge wall</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#94A3B8] sm:text-base">
            Track unlocked trail achievements across completions, distance,
            regions, difficulty, and streaks.
          </p>
        </section>

        <BadgeWall
          badges={loadState.status === "success" ? loadState.badges : []}
          errorMessage={loadState.status === "error" ? loadState.message : null}
          isLoading={loadState.status === "loading"}
          onRetry={loadBadges}
        />
      </div>
    </main>
  );
}

export { BadgeWallPage };
