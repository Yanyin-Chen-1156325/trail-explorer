using backend.Data;
using backend.DTOs.Badge;
using backend.Enums;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class BadgeService : IBadgeService
{
    private readonly ApplicationDbContext _context;

    public BadgeService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<BadgeResponse>> GetUserBadgesAsync(Guid userId)
    {
        var completedTrails = await _context.CheckIns
            .AsNoTracking()
            .Where(checkIn => checkIn.UserId == userId && !checkIn.IsHidden)
            .Select(checkIn => new BadgeProgressTrail(
                checkIn.CompletedDate,
                checkIn.Trail.Region,
                checkIn.Trail.DistanceKm,
                checkIn.Trail.Difficulty))
            .ToListAsync();

        var progress = CalculateProgress(completedTrails);

        var unlockedBadges = await _context.UserBadges
            .AsNoTracking()
            .Where(userBadge => userBadge.UserId == userId)
            .Select(userBadge => new
            {
                userBadge.BadgeId,
                userBadge.UnlockedAt
            })
            .ToDictionaryAsync(
                userBadge => userBadge.BadgeId,
                userBadge => userBadge.UnlockedAt);

        var badges = await _context.Badges
            .AsNoTracking()
            .OrderBy(badge => badge.Type)
            .ThenBy(badge => badge.Name)
            .ToListAsync();

        return badges
            .Select(badge =>
            {
                var isUnlocked = unlockedBadges.TryGetValue(
                    badge.Id,
                    out var unlockedAt);

                return new BadgeResponse
                {
                    Id = badge.Id,
                    Name = badge.Name,
                    Description = badge.Description,
                    IconUrl = badge.IconUrl,
                    Type = badge.Type,
                    IsUnlocked = isUnlocked,
                    UnlockedAt = isUnlocked ? unlockedAt : null,
                    CurrentValue = progress.GetCurrentValue(badge),
                    TargetValue = progress.GetTargetValue(badge),
                    ProgressLabel = progress.GetProgressLabel(badge)
                };
            })
            .ToList();
    }

    private static BadgeProgressSummary CalculateProgress(
        IReadOnlyCollection<BadgeProgressTrail> completedTrails)
    {
        var completedTrailCount = completedTrails.Count;
        var totalDistanceKm = completedTrails.Sum(trail => trail.DistanceKm);
        var completedRegionCount = completedTrails
            .Select(trail => trail.Region)
            .Where(region => !string.IsNullOrWhiteSpace(region))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Count();
        var hardTrailCount = completedTrails.Count(trail => trail.Difficulty == TrailDifficulty.Hard);
        var weeklyStreak = CalculateWeeklyStreak(completedTrails);
        var hasPortHillsTrail = completedTrails.Any(trail =>
            ContainsRegion(trail.Region, "Port Hills"));
        var hasBanksPeninsulaTrail = completedTrails.Any(trail =>
            ContainsRegion(trail.Region, "Banks Peninsula"));

        return new BadgeProgressSummary(
            completedTrailCount,
            totalDistanceKm,
            completedRegionCount,
            hardTrailCount,
            weeklyStreak,
            hasPortHillsTrail,
            hasBanksPeninsulaTrail);
    }

    private static int CalculateWeeklyStreak(
        IReadOnlyCollection<BadgeProgressTrail> completedTrails)
    {
        var completedWeeks = completedTrails
            .Select(trail => GetWeekStartDate(trail.CompletedDate))
            .Distinct()
            .OrderByDescending(weekStartDate => weekStartDate)
            .ToList();

        if (completedWeeks.Count == 0)
        {
            return 0;
        }

        var streak = 1;
        var previousWeekStartDate = completedWeeks[0];

        foreach (var weekStartDate in completedWeeks.Skip(1))
        {
            if (previousWeekStartDate.AddDays(-7) != weekStartDate)
            {
                break;
            }

            streak++;
            previousWeekStartDate = weekStartDate;
        }

        return streak;
    }

    private static DateOnly GetWeekStartDate(DateTime date)
    {
        var dateOnly = DateOnly.FromDateTime(date.Date);
        var daysSinceMonday = ((int)dateOnly.DayOfWeek - (int)DayOfWeek.Monday + 7) % 7;

        return dateOnly.AddDays(-daysSinceMonday);
    }

    private static bool ContainsRegion(string region, string targetRegion)
    {
        return region.Contains(targetRegion, StringComparison.OrdinalIgnoreCase);
    }

    private sealed record BadgeProgressTrail(
        DateTime CompletedDate,
        string Region,
        decimal DistanceKm,
        TrailDifficulty Difficulty);

    private sealed record BadgeProgressSummary(
        int CompletedTrailCount,
        decimal TotalDistanceKm,
        int CompletedRegionCount,
        int HardTrailCount,
        int WeeklyStreak,
        bool HasPortHillsTrail,
        bool HasBanksPeninsulaTrail)
    {
        public decimal GetCurrentValue(Entities.Badge badge)
        {
            return badge.Type switch
            {
                BadgeType.Completion => CompletedTrailCount,
                BadgeType.Distance => TotalDistanceKm,
                BadgeType.Region => GetRegionCurrentValue(badge.Name),
                BadgeType.Difficulty => HardTrailCount,
                BadgeType.Streak => WeeklyStreak,
                _ => 0
            };
        }

        public decimal GetTargetValue(Entities.Badge badge)
        {
            if (BadgeRuleCatalog.CompletionThresholds.TryGetValue(badge.Name, out var completionTarget))
            {
                return completionTarget;
            }

            if (BadgeRuleCatalog.DistanceThresholds.TryGetValue(badge.Name, out var distanceTarget))
            {
                return distanceTarget;
            }

            if (BadgeRuleCatalog.ExpertTrailThresholds.TryGetValue(badge.Name, out var expertTrailTarget))
            {
                return expertTrailTarget;
            }

            if (BadgeRuleCatalog.StreakThresholds.TryGetValue(badge.Name, out var streakTarget))
            {
                return streakTarget;
            }

            return badge.Name switch
            {
                "Port Hills Explorer" => 1,
                "Banks Peninsula Explorer" => 1,
                "Canterbury Explorer" => 3,
                _ => 1
            };
        }

        public string GetProgressLabel(Entities.Badge badge)
        {
            var currentValue = GetCurrentValue(badge);
            var targetValue = GetTargetValue(badge);

            return badge.Type switch
            {
                BadgeType.Completion => $"{FormatNumber(currentValue)}/{FormatNumber(targetValue)} trails",
                BadgeType.Distance => $"{FormatNumber(currentValue)}/{FormatNumber(targetValue)} km",
                BadgeType.Region => $"{FormatNumber(currentValue)}/{FormatNumber(targetValue)} regions",
                BadgeType.Difficulty => $"{FormatNumber(currentValue)}/{FormatNumber(targetValue)} hard trails",
                BadgeType.Streak => $"{FormatNumber(currentValue)}/{FormatNumber(targetValue)} weeks",
                _ => $"{FormatNumber(currentValue)}/{FormatNumber(targetValue)}"
            };
        }

        private decimal GetRegionCurrentValue(string badgeName)
        {
            return badgeName switch
            {
                "Port Hills Explorer" => HasPortHillsTrail ? 1 : 0,
                "Banks Peninsula Explorer" => HasBanksPeninsulaTrail ? 1 : 0,
                "Canterbury Explorer" => CompletedRegionCount,
                _ => 0
            };
        }

        private static string FormatNumber(decimal value)
        {
            return value % 1 == 0
                ? value.ToString("0")
                : value.ToString("0.#");
        }
    }
}
