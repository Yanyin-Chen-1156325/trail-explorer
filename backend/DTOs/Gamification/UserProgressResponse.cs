namespace backend.DTOs.Gamification;

public record UserProgressResponse(
    int TotalXp,
    int CurrentLevel,
    int CurrentLevelMinimumXp,
    int? NextLevel,
    int? NextLevelMinimumXp,
    int XpIntoCurrentLevel,
    int XpRequiredForNextLevel,
    decimal ProgressPercent);
