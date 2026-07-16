using backend.Data;
using backend.DTOs.Dashboard;
using backend.DTOs.Gamification;
using backend.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class DashboardService : IDashboardService
{
    private readonly ApplicationDbContext _context;
    private readonly IXpCalculatorService _xpCalculatorService;
    private readonly ILevelCalculatorService _levelCalculatorService;
    private readonly IStreakCalculatorService _streakCalculatorService;
    private readonly ILeaderboardService _leaderboardService;
    private readonly TimeProvider _timeProvider;

    public DashboardService(
        ApplicationDbContext context,
        IXpCalculatorService xpCalculatorService,
        ILevelCalculatorService levelCalculatorService,
        IStreakCalculatorService streakCalculatorService,
        ILeaderboardService leaderboardService,
        TimeProvider timeProvider)
    {
        _context = context;
        _xpCalculatorService = xpCalculatorService;
        _levelCalculatorService = levelCalculatorService;
        _streakCalculatorService = streakCalculatorService;
        _leaderboardService = leaderboardService;
        _timeProvider = timeProvider;
    }

    public async Task<DashboardResponse> GetDashboardAsync(Guid userId)
    {
        var completedTrails = await _context.CheckIns
            .AsNoTracking()
            .Where(checkIn => checkIn.UserId == userId && !checkIn.IsHidden)
            .Select(checkIn => new CompletedTrailDashboardData(
                checkIn.Id,
                checkIn.TrailId,
                checkIn.Trail.Name,
                checkIn.Trail.Region,
                checkIn.Trail.DistanceKm,
                checkIn.Trail.Difficulty,
                checkIn.CompletedDate))
            .ToListAsync();

        var progress = CalculateProgress(completedTrails);
        var totalDistanceKm = completedTrails.Sum(trail => trail.DistanceKm);
        var unlockedBadgeCount = await _context.UserBadges
            .AsNoTracking()
            .CountAsync(userBadge => userBadge.UserId == userId);
        var currentDateUtc = _timeProvider.GetUtcNow().UtcDateTime;
        var weeklyStreak = _streakCalculatorService.CalculateWeeklyStreak(
            completedTrails.Select(trail => trail.CompletedDate),
            currentDateUtc);
        var leaderboardRank = await _leaderboardService.GetUserRankAsync(userId);
        var recentBadges = await GetRecentBadgesAsync(userId);
        var recentCheckIns = completedTrails
            .OrderByDescending(trail => trail.CompletedDate)
            .ThenBy(trail => trail.TrailName)
            .Take(5)
            .Select(trail => new DashboardCheckInResponse(
                trail.CheckInId,
                trail.TrailId,
                trail.TrailName,
                trail.Region,
                trail.DistanceKm,
                trail.CompletedDate))
            .ToList();

        return new DashboardResponse(
            progress,
            new DashboardUserSummaryResponse(
                progress.TotalXp,
                progress.CurrentLevel,
                completedTrails.Count,
                totalDistanceKm,
                unlockedBadgeCount),
            new DashboardTrailStatisticsResponse(
                completedTrails.Count,
                completedTrails.Select(trail => trail.TrailId).Distinct().Count(),
                completedTrails
                    .Select(trail => trail.Region)
                    .Where(region => !string.IsNullOrWhiteSpace(region))
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .Count()),
            new DashboardDistanceStatisticsResponse(
                totalDistanceKm,
                completedTrails.Count == 0
                    ? 0m
                    : Math.Round(totalDistanceKm / completedTrails.Count, 2, MidpointRounding.AwayFromZero),
                completedTrails.Count == 0
                    ? 0m
                    : completedTrails.Max(trail => trail.DistanceKm)),
            weeklyStreak,
            leaderboardRank,
            recentBadges,
            recentCheckIns);
    }

    private UserProgressResponse CalculateProgress(
        IReadOnlyCollection<CompletedTrailDashboardData> completedTrails)
    {
        var totalXp = completedTrails.Sum(trail =>
            _xpCalculatorService.CalculateXp(trail.DistanceKm, trail.Difficulty));
        var levelProgress = _levelCalculatorService.CalculateProgress(totalXp);

        return new UserProgressResponse(
            totalXp,
            levelProgress.CurrentLevel,
            levelProgress.CurrentLevelMinimumXp,
            levelProgress.NextLevel,
            levelProgress.NextLevelMinimumXp,
            levelProgress.XpIntoCurrentLevel,
            levelProgress.XpRequiredForNextLevel,
            levelProgress.ProgressPercent);
    }

    private async Task<IReadOnlyList<DashboardBadgeResponse>> GetRecentBadgesAsync(Guid userId)
    {
        return await _context.UserBadges
            .AsNoTracking()
            .Where(userBadge => userBadge.UserId == userId)
            .OrderByDescending(userBadge => userBadge.UnlockedAt)
            .ThenBy(userBadge => userBadge.Badge.Name)
            .Take(5)
            .Select(userBadge => new DashboardBadgeResponse(
                userBadge.Badge.Id,
                userBadge.Badge.Name,
                userBadge.Badge.Description,
                userBadge.Badge.IconUrl,
                userBadge.Badge.Type,
                userBadge.UnlockedAt))
            .ToListAsync();
    }

    private sealed record CompletedTrailDashboardData(
        Guid CheckInId,
        Guid TrailId,
        string TrailName,
        string Region,
        decimal DistanceKm,
        Enums.TrailDifficulty Difficulty,
        DateTime CompletedDate);

}
