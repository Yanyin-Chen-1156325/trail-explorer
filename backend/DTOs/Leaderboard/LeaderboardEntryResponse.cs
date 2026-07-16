namespace backend.DTOs.Leaderboard;

public record LeaderboardEntryResponse(
    int Rank,
    Guid UserId,
    string DisplayName,
    int TotalXp,
    int CurrentLevel,
    int CompletedTrails,
    decimal TotalDistanceKm,
    int UnlockedBadges);
