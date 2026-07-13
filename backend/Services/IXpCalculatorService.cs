using backend.Enums;

namespace backend.Services;

public interface IXpCalculatorService
{
    int CalculateXp(decimal distanceKm, TrailDifficulty difficulty);
}
