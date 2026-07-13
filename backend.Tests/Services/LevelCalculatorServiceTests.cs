using backend.Services;

namespace backend.Tests.Services;

public class LevelCalculatorServiceTests
{
    private readonly LevelCalculatorService _service = new();

    public static TheoryData<int, int> LevelCases => new()
    {
        { 0, 1 },
        { 499, 1 },
        { 500, 2 },
        { 999, 2 },
        { 1_000, 3 },
        { 1_999, 3 },
        { 2_000, 4 },
        { 3_499, 4 },
        { 3_500, 5 },
        { 4_999, 5 },
        { 5_000, 6 },
        { 7_499, 6 },
        { 7_500, 7 },
        { 9_999, 7 },
        { 10_000, 8 },
        { 14_999, 8 },
        { 15_000, 9 },
        { 19_999, 9 },
        { 20_000, 10 },
        { 50_000, 10 }
    };

    [Theory]
    [MemberData(nameof(LevelCases))]
    public void CalculateLevel_ReturnsHighestLevelReachedByTotalXp(
        int totalXp,
        int expectedLevel)
    {
        var level = _service.CalculateLevel(totalXp);

        Assert.Equal(expectedLevel, level);
    }

    [Fact]
    public void CalculateLevel_WithNegativeTotalXp_ThrowsArgumentOutOfRangeException()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            _service.CalculateLevel(-1));
    }

    [Fact]
    public void CalculateProgress_WhenBetweenLevels_ReturnsProgressToNextLevel()
    {
        var progress = _service.CalculateProgress(750);

        Assert.Equal(2, progress.CurrentLevel);
        Assert.Equal(500, progress.CurrentLevelMinimumXp);
        Assert.Equal(3, progress.NextLevel);
        Assert.Equal(1_000, progress.NextLevelMinimumXp);
        Assert.Equal(250, progress.XpIntoCurrentLevel);
        Assert.Equal(500, progress.XpRequiredForNextLevel);
        Assert.Equal(50m, progress.ProgressPercent);
    }

    [Fact]
    public void CalculateProgress_WhenAtMaximumLevel_ReturnsCompletedProgress()
    {
        var progress = _service.CalculateProgress(25_000);

        Assert.Equal(10, progress.CurrentLevel);
        Assert.Equal(20_000, progress.CurrentLevelMinimumXp);
        Assert.Null(progress.NextLevel);
        Assert.Null(progress.NextLevelMinimumXp);
        Assert.Equal(5_000, progress.XpIntoCurrentLevel);
        Assert.Equal(0, progress.XpRequiredForNextLevel);
        Assert.Equal(100m, progress.ProgressPercent);
    }
}
