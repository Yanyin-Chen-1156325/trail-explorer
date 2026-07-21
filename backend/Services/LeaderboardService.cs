using backend.Data;
using backend.DTOs.Leaderboard;
using backend.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace backend.Services;

public class LeaderboardService : ILeaderboardService
{
    private const int MaximumLeaderboardLimit = 100;
    private const string LeaderboardCacheKey = "leaderboard:ranked-users";

    private readonly ApplicationDbContext _context;
    private readonly IXpCalculatorService _xpCalculatorService;
    private readonly ILevelCalculatorService _levelCalculatorService;
    private readonly IMemoryCache _memoryCache;

    public LeaderboardService(
        ApplicationDbContext context,
        IXpCalculatorService xpCalculatorService,
        ILevelCalculatorService levelCalculatorService,
        IMemoryCache memoryCache)
    {
        _context = context;
        _xpCalculatorService = xpCalculatorService;
        _levelCalculatorService = levelCalculatorService;
        _memoryCache = memoryCache;
    }

    public async Task<IReadOnlyList<LeaderboardEntryResponse>> GetLeaderboardAsync(int limit = 50)
    {
        var normalizedLimit = Math.Clamp(limit, 1, MaximumLeaderboardLimit);
        var rankedUsers = await GetRankedUsersAsync();

        return rankedUsers
            .Take(normalizedLimit)
            .Select((summary, index) => ToResponse(summary, index + 1))
            .ToList();
    }

    public async Task<int> GetUserRankAsync(Guid userId)
    {
        var rankedUsers = await GetRankedUsersAsync();
        var index = rankedUsers.FindIndex(summary => summary.UserId == userId);

        return index >= 0 ? index + 1 : 0;
    }

    public void InvalidateLeaderboardCache()
    {
        _memoryCache.Remove(LeaderboardCacheKey);
    }

    private async Task<List<LeaderboardUserSummary>> GetRankedUsersAsync()
    {
        if (_memoryCache.TryGetValue<List<LeaderboardUserSummary>>(
            LeaderboardCacheKey,
            out var cachedRanking))
        {
            return cachedRanking ?? [];
        }

        var ranking = await CalculateRankedUsersAsync();
        _memoryCache.Set(
            LeaderboardCacheKey,
            ranking,
            new MemoryCacheEntryOptions
            {
                SlidingExpiration = TimeSpan.FromMinutes(5),
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(15)
            });

        return ranking;
    }

    private async Task<List<LeaderboardUserSummary>> CalculateRankedUsersAsync()
    {
        var users = await _context.Users
            .AsNoTracking()
            .Where(user => user.Role == UserRole.User)
            .Select(user => new LeaderboardUser(
                user.Id,
                user.DisplayName))
            .ToListAsync();
        var checkIns = await _context.CheckIns
            .AsNoTracking()
            .Where(checkIn => !checkIn.IsHidden)
            .Select(checkIn => new LeaderboardTrailCompletion(
                checkIn.UserId,
                checkIn.Trail.DistanceKm,
                checkIn.Trail.Difficulty))
            .ToListAsync();
        var unlockedBadgeCounts = await _context.UserBadges
            .AsNoTracking()
            .GroupBy(userBadge => userBadge.UserId)
            .Select(group => new
            {
                UserId = group.Key,
                Count = group.Count()
            })
            .ToDictionaryAsync(item => item.UserId, item => item.Count);

        return users
            .GroupJoin(
                checkIns,
                user => user.UserId,
                checkIn => checkIn.UserId,
                (user, userCheckIns) =>
                {
                    var completions = userCheckIns.ToList();
                    var totalXp = _xpCalculatorService.CalculateTotalXp(
                        completions.Select(completion => new TrailXpInput(
                            completion.DistanceKm,
                            completion.Difficulty)));

                    return new LeaderboardUserSummary(
                        user.UserId,
                        user.DisplayName,
                        totalXp,
                        _levelCalculatorService.CalculateLevel(totalXp),
                        completions.Count,
                        completions.Sum(completion => completion.DistanceKm),
                        unlockedBadgeCounts.GetValueOrDefault(user.UserId));
                })
            .OrderByDescending(summary => summary.TotalXp)
            .ThenByDescending(summary => summary.CompletedTrails)
            .ThenByDescending(summary => summary.TotalDistanceKm)
            .ThenBy(summary => summary.DisplayName)
            .ThenBy(summary => summary.UserId)
            .ToList();
    }

    private static LeaderboardEntryResponse ToResponse(
        LeaderboardUserSummary summary,
        int rank)
    {
        return new LeaderboardEntryResponse(
            rank,
            summary.UserId,
            summary.DisplayName,
            summary.TotalXp,
            summary.CurrentLevel,
            summary.CompletedTrails,
            summary.TotalDistanceKm,
            summary.UnlockedBadges);
    }

    private sealed record LeaderboardUser(Guid UserId, string DisplayName);

    private sealed record LeaderboardTrailCompletion(
        Guid UserId,
        decimal DistanceKm,
        TrailDifficulty Difficulty);

    private sealed record LeaderboardUserSummary(
        Guid UserId,
        string DisplayName,
        int TotalXp,
        int CurrentLevel,
        int CompletedTrails,
        decimal TotalDistanceKm,
        int UnlockedBadges);
}
