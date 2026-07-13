using backend.Enums;

namespace backend.Services;

public class XpCalculatorService : IXpCalculatorService
{
    private const decimal BaseXpPerKilometre = 10m;

    private static readonly IReadOnlyDictionary<TrailDifficulty, decimal> DifficultyMultipliers =
        new Dictionary<TrailDifficulty, decimal>
        {
            [TrailDifficulty.Easy] = 1.0m,
            [TrailDifficulty.Moderate] = 1.2m,
            [TrailDifficulty.Hard] = 1.5m
        };

    public int CalculateXp(decimal distanceKm, TrailDifficulty difficulty)
    {
        if (distanceKm < 0)
        {
            throw new ArgumentOutOfRangeException(
                nameof(distanceKm),
                distanceKm,
                "Trail distance cannot be negative.");
        }

        if (!DifficultyMultipliers.TryGetValue(difficulty, out var multiplier))
        {
            throw new ArgumentOutOfRangeException(
                nameof(difficulty),
                difficulty,
                "Trail difficulty is not supported.");
        }

        var xp = distanceKm * BaseXpPerKilometre * multiplier;

        return (int)Math.Round(xp, MidpointRounding.AwayFromZero);
    }
}
