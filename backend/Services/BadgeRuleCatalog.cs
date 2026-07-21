using backend.Enums;

namespace backend.Services;

public sealed record BadgeDefinition(
    string Name,
    string Description,
    string IconUrl,
    BadgeType Type);

public static class BadgeRuleCatalog
{
    public static readonly IReadOnlyList<BadgeDefinition> BadgeDefinitions =
    [
        new("First Trail", "Complete your first trail.", "/badges/first-trail.svg", BadgeType.Completion),
        new("Trail Explorer", "Complete 10 trails.", "/badges/trail-explorer.svg", BadgeType.Completion),
        new("Trail Master", "Complete 25 trails.", "/badges/trail-master.svg", BadgeType.Completion),
        new("Trail Legend", "Complete 50 trails.", "/badges/trail-legend.svg", BadgeType.Completion),
        new("Trail Champion", "Complete 100 trails.", "/badges/trail-champion.svg", BadgeType.Completion),
        new("50km Explorer", "Complete 50 km of trails.", "/badges/50km-explorer.svg", BadgeType.Distance),
        new("100km Explorer", "Complete 100 km of trails.", "/badges/100km-explorer.svg", BadgeType.Distance),
        new("250km Explorer", "Complete 250 km of trails.", "/badges/250km-explorer.svg", BadgeType.Distance),
        new("500km Explorer", "Complete 500 km of trails.", "/badges/500km-explorer.svg", BadgeType.Distance),
        new("1000km Explorer", "Complete 1000 km of trails.", "/badges/1000km-explorer.svg", BadgeType.Distance),
        new("Port Hills Explorer", "Complete a trail in Port Hills.", "/badges/port-hills-explorer.svg", BadgeType.Region),
        new("Banks Peninsula Explorer", "Complete a trail in Banks Peninsula.", "/badges/banks-peninsula-explorer.svg", BadgeType.Region),
        new("Canterbury Explorer", "Complete trails across three Canterbury regions.", "/badges/canterbury-explorer.svg", BadgeType.Region),
        new("Advanced Explorer", "Complete your first advanced trail.", "/badges/advanced-explorer.svg", BadgeType.Difficulty),
        new("Expert Explorer", "Complete your first expert-level trail.", "/badges/expert-explorer.svg", BadgeType.Difficulty),
        new("Expert Specialist", "Complete 5 expert-level trails.", "/badges/expert-specialist.svg", BadgeType.Difficulty),
        new("Expert Master", "Complete 10 expert-level trails.", "/badges/expert-master.svg", BadgeType.Difficulty),
        new("2 Week Streak", "Complete trails in 2 consecutive weeks.", "/badges/2-week-streak.svg", BadgeType.Streak),
        new("4 Week Streak", "Complete trails in 4 consecutive weeks.", "/badges/4-week-streak.svg", BadgeType.Streak),
        new("8 Week Streak", "Complete trails in 8 consecutive weeks.", "/badges/8-week-streak.svg", BadgeType.Streak),
        new("12 Week Streak", "Complete trails in 12 consecutive weeks.", "/badges/12-week-streak.svg", BadgeType.Streak),
        new("24 Week Streak", "Complete trails in 24 consecutive weeks.", "/badges/24-week-streak.svg", BadgeType.Streak)
    ];

    public static readonly IReadOnlyDictionary<string, int> CompletionThresholds =
        new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)
        {
            ["First Trail"] = 1,
            ["Trail Explorer"] = 10,
            ["Trail Master"] = 25,
            ["Trail Legend"] = 50,
            ["Trail Champion"] = 100
        };

    public static readonly IReadOnlyDictionary<string, decimal> DistanceThresholds =
        new Dictionary<string, decimal>(StringComparer.OrdinalIgnoreCase)
        {
            ["50km Explorer"] = 50m,
            ["100km Explorer"] = 100m,
            ["250km Explorer"] = 250m,
            ["500km Explorer"] = 500m,
            ["1000km Explorer"] = 1000m
        };

    public static readonly IReadOnlyDictionary<string, int> AdvancedTrailThresholds =
        new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)
        {
            ["Advanced Explorer"] = 1
        };

    public static readonly IReadOnlyDictionary<string, int> ExpertTrailThresholds =
        new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)
        {
            ["Expert Explorer"] = 1,
            ["Expert Specialist"] = 5,
            ["Expert Master"] = 10
        };

    public static readonly IReadOnlyDictionary<string, int> StreakThresholds =
        new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)
        {
            ["2 Week Streak"] = 2,
            ["4 Week Streak"] = 4,
            ["8 Week Streak"] = 8,
            ["12 Week Streak"] = 12,
            ["24 Week Streak"] = 24
        };
}
