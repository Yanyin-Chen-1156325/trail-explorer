using backend.DTOs.Gamification;

namespace backend.DTOs.Dashboard;

public record DashboardResponse(
    UserProgressResponse Progress,
    DashboardUserSummaryResponse UserSummary,
    DashboardTrailStatisticsResponse TrailStatistics,
    DashboardDistanceStatisticsResponse DistanceStatistics,
    int WeeklyStreak,
    int LeaderboardRank,
    IReadOnlyList<DashboardBadgeResponse> RecentBadges,
    IReadOnlyList<DashboardCheckInResponse> RecentCheckIns);
