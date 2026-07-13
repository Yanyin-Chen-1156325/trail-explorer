namespace backend.Services;

public class LevelCalculatorService : ILevelCalculatorService
{
    private static readonly IReadOnlyList<LevelThreshold> LevelThresholds =
    [
        new(1, 0),
        new(2, 500),
        new(3, 1_000),
        new(4, 2_000),
        new(5, 3_500),
        new(6, 5_000),
        new(7, 7_500),
        new(8, 10_000),
        new(9, 15_000),
        new(10, 20_000)
    ];

    public int CalculateLevel(int totalXp)
    {
        if (totalXp < 0)
        {
            throw new ArgumentOutOfRangeException(
                nameof(totalXp),
                totalXp,
                "Total XP cannot be negative.");
        }

        var currentLevel = LevelThresholds[0].Level;

        foreach (var threshold in LevelThresholds)
        {
            if (totalXp < threshold.MinimumXp)
            {
                break;
            }

            currentLevel = threshold.Level;
        }

        return currentLevel;
    }

    public LevelProgressResult CalculateProgress(int totalXp)
    {
        if (totalXp < 0)
        {
            throw new ArgumentOutOfRangeException(
                nameof(totalXp),
                totalXp,
                "Total XP cannot be negative.");
        }

        var currentThreshold = GetCurrentThreshold(totalXp);
        var nextThreshold = LevelThresholds
            .FirstOrDefault(threshold => threshold.MinimumXp > totalXp);

        if (nextThreshold is null)
        {
            return new LevelProgressResult(
                currentThreshold.Level,
                currentThreshold.MinimumXp,
                null,
                null,
                totalXp - currentThreshold.MinimumXp,
                0,
                100m);
        }

        var xpIntoCurrentLevel = totalXp - currentThreshold.MinimumXp;
        var xpRequiredForNextLevel = nextThreshold.MinimumXp - currentThreshold.MinimumXp;
        var progressPercent = Math.Round(
            xpIntoCurrentLevel / (decimal)xpRequiredForNextLevel * 100m,
            2,
            MidpointRounding.AwayFromZero);

        return new LevelProgressResult(
            currentThreshold.Level,
            currentThreshold.MinimumXp,
            nextThreshold.Level,
            nextThreshold.MinimumXp,
            xpIntoCurrentLevel,
            xpRequiredForNextLevel,
            progressPercent);
    }

    private static LevelThreshold GetCurrentThreshold(int totalXp)
    {
        var currentThreshold = LevelThresholds[0];

        foreach (var threshold in LevelThresholds)
        {
            if (totalXp < threshold.MinimumXp)
            {
                break;
            }

            currentThreshold = threshold;
        }

        return currentThreshold;
    }

    private sealed record LevelThreshold(int Level, int MinimumXp);
}
