using backend.Enums;
using backend.Services;

namespace backend.Tests.Services;

public class XpCalculatorServiceTests
{
    private readonly XpCalculatorService _service = new();

    public static TheoryData<decimal, TrailDifficulty, int> XpCases => new()
    {
        { 5m, TrailDifficulty.Easy, 50 },
        { 10m, TrailDifficulty.Intermediate, 120 },
        { 12m, TrailDifficulty.Advanced, 180 },
        { 8.5m, TrailDifficulty.Advanced, 128 },
        { 20m, TrailDifficulty.Expert, 400 }
    };

    [Theory]
    [MemberData(nameof(XpCases))]
    public void CalculateXp_ReturnsDistanceXpWithDifficultyMultiplier(
        decimal distanceKm,
        TrailDifficulty difficulty,
        int expectedXp)
    {
        var xp = _service.CalculateXp(distanceKm, difficulty);

        Assert.Equal(expectedXp, xp);
    }

    [Fact]
    public void CalculateXp_WithZeroDistance_ReturnsZero()
    {
        var xp = _service.CalculateXp(0m, TrailDifficulty.Easy);

        Assert.Equal(0, xp);
    }

    [Fact]
    public void CalculateXp_WithNegativeDistance_ThrowsArgumentOutOfRangeException()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            _service.CalculateXp(-1m, TrailDifficulty.Easy));
    }

    [Fact]
    public void CalculateXp_WithUnsupportedDifficulty_ThrowsArgumentOutOfRangeException()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            _service.CalculateXp(5m, (TrailDifficulty)999));
    }

    [Fact]
    public void CalculateTotalXp_SumsIndividuallyRoundedTrailRewards()
    {
        TrailXpInput[] trails =
        [
            new(8.5m, TrailDifficulty.Advanced),
            new(10m, TrailDifficulty.Intermediate),
            new(20m, TrailDifficulty.Expert)
        ];

        var totalXp = _service.CalculateTotalXp(trails);

        Assert.Equal(648, totalXp);
    }

    [Fact]
    public void CalculateTotalXp_WithNoTrails_ReturnsZero()
    {
        Assert.Equal(0, _service.CalculateTotalXp([]));
    }
}
