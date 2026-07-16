using backend.Services;

namespace backend.Tests.Services;

public class StreakCalculatorServiceTests
{
    private readonly StreakCalculatorService _service = new();

    [Fact]
    public void CalculateWeeklyStreak_WithConsecutiveWeeks_ReturnsCurrentStreak()
    {
        var currentDate = new DateTime(2026, 7, 16, 12, 0, 0, DateTimeKind.Utc);
        var completedDates = new[]
        {
            new DateTime(2026, 7, 15, 8, 0, 0, DateTimeKind.Utc),
            new DateTime(2026, 7, 8, 8, 0, 0, DateTimeKind.Utc),
            new DateTime(2026, 7, 1, 8, 0, 0, DateTimeKind.Utc)
        };

        var streak = _service.CalculateWeeklyStreak(completedDates, currentDate);

        Assert.Equal(3, streak);
    }

    [Fact]
    public void CalculateWeeklyStreak_AllowsCurrentWeekToBeIncomplete()
    {
        var currentDate = new DateTime(2026, 7, 16, 12, 0, 0, DateTimeKind.Utc);
        var completedDates = new[]
        {
            new DateTime(2026, 7, 8, 8, 0, 0, DateTimeKind.Utc),
            new DateTime(2026, 7, 1, 8, 0, 0, DateTimeKind.Utc)
        };

        var streak = _service.CalculateWeeklyStreak(completedDates, currentDate);

        Assert.Equal(2, streak);
    }

    [Fact]
    public void CalculateWeeklyStreak_WithMissedPreviousWeek_ReturnsZero()
    {
        var currentDate = new DateTime(2026, 7, 16, 12, 0, 0, DateTimeKind.Utc);
        var completedDates = new[]
        {
            new DateTime(2026, 6, 24, 8, 0, 0, DateTimeKind.Utc)
        };

        var streak = _service.CalculateWeeklyStreak(completedDates, currentDate);

        Assert.Equal(0, streak);
    }
}
