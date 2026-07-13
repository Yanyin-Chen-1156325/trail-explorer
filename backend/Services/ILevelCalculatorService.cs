namespace backend.Services;

public interface ILevelCalculatorService
{
    int CalculateLevel(int totalXp);

    LevelProgressResult CalculateProgress(int totalXp);
}

public record LevelProgressResult(
    int CurrentLevel,
    int CurrentLevelMinimumXp,
    int? NextLevel,
    int? NextLevelMinimumXp,
    int XpIntoCurrentLevel,
    int XpRequiredForNextLevel,
    decimal ProgressPercent);
