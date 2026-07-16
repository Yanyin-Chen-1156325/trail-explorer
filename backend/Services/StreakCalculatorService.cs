namespace backend.Services;

public class StreakCalculatorService : IStreakCalculatorService
{
    public int CalculateWeeklyStreak(
        IEnumerable<DateTime> completedDates,
        DateTime currentDateUtc)
    {
        var completedWeeks = completedDates
            .Select(GetWeekStart)
            .Distinct()
            .ToHashSet();

        if (completedWeeks.Count == 0)
        {
            return 0;
        }

        var currentWeekStart = GetWeekStart(currentDateUtc);
        var previousWeekStart = currentWeekStart.AddDays(-7);
        var streakWeekStart = completedWeeks.Contains(currentWeekStart)
            ? currentWeekStart
            : previousWeekStart;

        if (!completedWeeks.Contains(streakWeekStart))
        {
            return 0;
        }

        var streak = 0;

        while (completedWeeks.Contains(streakWeekStart))
        {
            streak++;
            streakWeekStart = streakWeekStart.AddDays(-7);
        }

        return streak;
    }

    private static DateTime GetWeekStart(DateTime value)
    {
        var date = value.Kind == DateTimeKind.Utc
            ? value.Date
            : value.ToUniversalTime().Date;
        var daysSinceMonday = ((int)date.DayOfWeek - (int)DayOfWeek.Monday + 7) % 7;

        return date.AddDays(-daysSinceMonday);
    }
}
