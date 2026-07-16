namespace backend.DTOs.Dashboard;

public record DashboardUserSummaryResponse(
    int TotalXp,
    int CurrentLevel,
    int CompletedTrails,
    decimal TotalDistanceKm,
    int UnlockedBadges);
