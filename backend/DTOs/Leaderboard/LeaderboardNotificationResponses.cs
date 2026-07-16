using backend.Enums;

namespace backend.DTOs.Leaderboard;

public record LeaderboardXpUpdateResponse(
    Guid UserId,
    int TotalXp,
    int CurrentLevel,
    int Rank);

public record LeaderboardRankingUpdateResponse(
    Guid UserId,
    int Rank);

public record LeaderboardBadgeUnlockResponse(
    Guid UserId,
    Guid BadgeId,
    string Name,
    string Description,
    string IconUrl,
    BadgeType Type,
    DateTime UnlockedAt);
