using backend.Data;
using backend.DTOs.Gamification;
using backend.Enums;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class UserProgressService : IUserProgressService
{
    private readonly ApplicationDbContext _context;
    private readonly IXpCalculatorService _xpCalculatorService;
    private readonly ILevelCalculatorService _levelCalculatorService;

    public UserProgressService(
        ApplicationDbContext context,
        IXpCalculatorService xpCalculatorService,
        ILevelCalculatorService levelCalculatorService)
    {
        _context = context;
        _xpCalculatorService = xpCalculatorService;
        _levelCalculatorService = levelCalculatorService;
    }

    public async Task<UserProgressResponse> GetUserProgressAsync(Guid userId)
    {
        var completedTrails = await _context.CheckIns
            .AsNoTracking()
            .Where(checkIn => checkIn.UserId == userId && !checkIn.IsHidden)
            .Select(checkIn => new CompletedTrailProgress(
                checkIn.Trail.DistanceKm,
                checkIn.Trail.Difficulty))
            .ToListAsync();

        var totalXp = _xpCalculatorService.CalculateTotalXp(completedTrails.Select(trail =>
            new TrailXpInput(trail.DistanceKm, trail.Difficulty)));
        var levelProgress = _levelCalculatorService.CalculateProgress(totalXp);

        return new UserProgressResponse(
            totalXp,
            levelProgress.CurrentLevel,
            levelProgress.CurrentLevelMinimumXp,
            levelProgress.NextLevel,
            levelProgress.NextLevelMinimumXp,
            levelProgress.XpIntoCurrentLevel,
            levelProgress.XpRequiredForNextLevel,
            levelProgress.ProgressPercent);
    }

    private sealed record CompletedTrailProgress(
        decimal DistanceKm,
        TrailDifficulty Difficulty);
}
