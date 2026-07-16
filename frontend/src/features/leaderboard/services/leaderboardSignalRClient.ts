import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";

import type {
  LeaderboardBadgeUnlock,
  LeaderboardEntry,
  LeaderboardRankingUpdate,
  LeaderboardXpUpdate,
  RawLeaderboardBadgeUnlock,
} from "../types/leaderboard";
import type { BadgeType, RawBadgeType } from "@/features/badges";

interface LeaderboardSignalRClientOptions {
  accessToken: string;
  hubUrl: string;
  onBadgeUnlocked?: (badge: LeaderboardBadgeUnlock) => void;
  onLeaderboardUpdated?: (leaderboard: LeaderboardEntry[]) => void;
  onRankingUpdated?: (ranking: LeaderboardRankingUpdate) => void;
  onXpUpdated?: (xpUpdate: LeaderboardXpUpdate) => void;
}

export interface LeaderboardSignalRClient {
  start(): Promise<void>;
  stop(): Promise<void>;
}

const badgeTypeLabels: BadgeType[] = [
  "Completion",
  "Distance",
  "Region",
  "Difficulty",
  "Streak",
];

function normalizeBadgeType(value: RawBadgeType): BadgeType {
  if (typeof value === "string") {
    return value;
  }

  return badgeTypeLabels[value] ?? badgeTypeLabels[0];
}

function normalizeBadgeUnlock(
  badge: RawLeaderboardBadgeUnlock,
): LeaderboardBadgeUnlock {
  return {
    ...badge,
    type: normalizeBadgeType(badge.type),
  };
}

export function createLeaderboardSignalRClient({
  accessToken,
  hubUrl,
  onBadgeUnlocked,
  onLeaderboardUpdated,
  onRankingUpdated,
  onXpUpdated,
}: LeaderboardSignalRClientOptions): LeaderboardSignalRClient {
  const connection: HubConnection = new HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => accessToken,
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();

  connection.on("LeaderboardUpdated", (leaderboard: LeaderboardEntry[]) => {
    onLeaderboardUpdated?.(leaderboard);
  });
  connection.on("RankingUpdated", (ranking: LeaderboardRankingUpdate) => {
    onRankingUpdated?.(ranking);
  });
  connection.on("XpUpdated", (xpUpdate: LeaderboardXpUpdate) => {
    onXpUpdated?.(xpUpdate);
  });
  connection.on("BadgeUnlocked", (badge: RawLeaderboardBadgeUnlock) => {
    onBadgeUnlocked?.(normalizeBadgeUnlock(badge));
  });

  return {
    async start() {
      if (connection.state === HubConnectionState.Disconnected) {
        await connection.start();
      }
    },
    async stop() {
      if (connection.state !== HubConnectionState.Disconnected) {
        await connection.stop();
      }
    },
  };
}
