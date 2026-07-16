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
    private readonly TimeProvider _timeProvider;

    public DashboardService(
        ApplicationDbContext context,
        IXpCalculatorService xpCalculatorService,
        ILevelCalculatorService levelCalculatorService,
        IStreakCalculatorService streakCalculatorService,
        TimeProvider timeProvider)
    {
        _context = context;
        _xpCalculatorService = xpCalculatorService;
        _levelCalculatorService = levelCalculatorService;
        _streakCalculatorService = streakCalculatorService;
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
        var leaderboardRank = await CalculateLeaderboardRankAsync(userId);
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

    private async Task<int> CalculateLeaderboardRankAsync(Guid userId)
    {
        var checkIns = await _context.CheckIns
            .AsNoTracking()
            .Where(checkIn => !checkIn.IsHidden)
            .Select(checkIn => new LeaderboardTrailData(
                checkIn.UserId,
                checkIn.Trail.DistanceKm,
                checkIn.Trail.Difficulty))
            .ToListAsync();

        var userIds = await _context.Users
            .AsNoTracking()
            .Select(user => user.Id)
            .ToListAsync();
        var ranking = userIds
            .GroupJoin(
                checkIns,
                id => id,
                checkIn => checkIn.UserId,
                (id, userCheckIns) =>
                {
                    var userTrails = userCheckIns.ToList();

                    return new LeaderboardUserSummary(
                        id,
                        userTrails.Sum(trail =>
                            _xpCalculatorService.CalculateXp(trail.DistanceKm, trail.Difficulty)),
                        userTrails.Count,
                        userTrails.Sum(trail => trail.DistanceKm));
                })
            .OrderByDescending(summary => summary.TotalXp)
            .ThenByDescending(summary => summary.CompletedTrails)
            .ThenByDescending(summary => summary.TotalDistanceKm)
            .ThenBy(summary => summary.UserId)
            .ToList();
        var rank = ranking.FindIndex(summary => summary.UserId == userId);

        return rank >= 0 ? rank + 1 : 0;
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

    private sealed record LeaderboardTrailData(
        Guid UserId,
        decimal DistanceKm,
        Enums.TrailDifficulty Difficulty);

    private sealed record LeaderboardUserSummary(
        Guid UserId,
        int TotalXp,
        int CompletedTrails,
        decimal TotalDistanceKm);
}
