namespace backend.Services;

public interface IStreakCalculatorService
{
    int CalculateWeeklyStreak(IEnumerable<DateTime> completedDates, DateTime currentDateUtc);
}
