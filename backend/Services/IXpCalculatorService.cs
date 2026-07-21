using backend.Enums;

namespace backend.Services;

public readonly record struct TrailXpInput(
    decimal DistanceKm,
    TrailDifficulty Difficulty);

public interface IXpCalculatorService
{
    int CalculateXp(decimal distanceKm, TrailDifficulty difficulty);

    int CalculateTotalXp(IEnumerable<TrailXpInput> trails);
}
