using backend.Data;
using backend.Entities;
using backend.Enums;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class BadgeEvaluationService : IBadgeEvaluationService
{
    private const int CanterburyExplorerRequiredRegions = 3;

    private readonly ApplicationDbContext _context;

    public BadgeEvaluationService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyCollection<Badge>> GetEligibleBadgesAsync(Guid userId)
    {
        var completedTrails = await _context.CheckIns
            .AsNoTracking()
            .Where(checkIn => checkIn.UserId == userId && !checkIn.IsHidden)
            .Select(checkIn => new CompletedTrailBadgeProgress(
                checkIn.CompletedDate,
                checkIn.Trail.Region,
                checkIn.Trail.DistanceKm,
                checkIn.Trail.Difficulty))
            .ToListAsync();

        if (completedTrails.Count == 0)
        {
            return [];
        }

        var eligibleBadgeNames = GetEligibleBadgeNames(completedTrails);

        return await _context.Badges
            .AsNoTracking()
            .Where(badge => eligibleBadgeNames.Contains(badge.Name))
            .OrderBy(badge => badge.Type)
            .ThenBy(badge => badge.Name)
            .ToListAsync();
    }

    private static IReadOnlySet<string> GetEligibleBadgeNames(
        IReadOnlyCollection<CompletedTrailBadgeProgress> completedTrails)
    {
        var eligibleBadgeNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var threshold in BadgeRuleCatalog.CompletionThresholds)
        {
            if (completedTrails.Count >= threshold.Value)
            {
                eligibleBadgeNames.Add(threshold.Key);
            }
        }

        var totalDistanceKm = completedTrails.Sum(trail => trail.DistanceKm);
        foreach (var threshold in BadgeRuleCatalog.DistanceThresholds)
        {
            if (totalDistanceKm >= threshold.Value)
            {
                eligibleBadgeNames.Add(threshold.Key);
            }
        }

        var completedRegions = completedTrails
            .Select(trail => trail.Region)
            .Where(region => !string.IsNullOrWhiteSpace(region))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Count();

        if (completedTrails.Any(trail => ContainsRegion(trail.Region, "Port Hills")))
        {
            eligibleBadgeNames.Add("Port Hills Explorer");
        }

        if (completedTrails.Any(trail => ContainsRegion(trail.Region, "Banks Peninsula")))
        {
            eligibleBadgeNames.Add("Banks Peninsula Explorer");
        }

        if (completedRegions >= CanterburyExplorerRequiredRegions)
        {
            eligibleBadgeNames.Add("Canterbury Explorer");
        }

        var expertTrailCount = completedTrails.Count(IsExpertLevelTrail);
        foreach (var threshold in BadgeRuleCatalog.ExpertTrailThresholds)
        {
            if (expertTrailCount >= threshold.Value)
            {
                eligibleBadgeNames.Add(threshold.Key);
            }
        }

        var weeklyStreak = CalculateWeeklyStreak(completedTrails);
        foreach (var threshold in BadgeRuleCatalog.StreakThresholds)
        {
            if (weeklyStreak >= threshold.Value)
            {
                eligibleBadgeNames.Add(threshold.Key);
            }
        }

        return eligibleBadgeNames;
    }

    private static bool ContainsRegion(string region, string targetRegion)
    {
        return region.Contains(targetRegion, StringComparison.OrdinalIgnoreCase);
    }

    private static bool IsExpertLevelTrail(CompletedTrailBadgeProgress trail)
    {
        return trail.Difficulty == TrailDifficulty.Hard;
    }

    private static int CalculateWeeklyStreak(
        IReadOnlyCollection<CompletedTrailBadgeProgress> completedTrails)
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

    private sealed record CompletedTrailBadgeProgress(
        DateTime CompletedDate,
        string Region,
        decimal DistanceKm,
        TrailDifficulty Difficulty);
}
