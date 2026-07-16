using backend.Data;
using backend.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class BadgeUnlockService : IBadgeUnlockService
{
    private readonly ApplicationDbContext _context;
    private readonly IBadgeEvaluationService _badgeEvaluationService;
    private readonly ILogger<BadgeUnlockService> _logger;

    public BadgeUnlockService(
        ApplicationDbContext context,
        IBadgeEvaluationService badgeEvaluationService,
        ILogger<BadgeUnlockService> logger)
    {
        _context = context;
        _badgeEvaluationService = badgeEvaluationService;
        _logger = logger;
    }

    public async Task<IReadOnlyCollection<Badge>> UnlockEligibleBadgesAsync(Guid userId)
    {
        var eligibleBadges = await _badgeEvaluationService.GetEligibleBadgesAsync(userId);

        if (eligibleBadges.Count == 0)
        {
            return [];
        }

        var eligibleBadgeIds = eligibleBadges
            .Select(badge => badge.Id)
            .ToHashSet();

        var unlockedBadgeIds = await _context.UserBadges
            .AsNoTracking()
            .Where(userBadge =>
                userBadge.UserId == userId &&
                eligibleBadgeIds.Contains(userBadge.BadgeId))
            .Select(userBadge => userBadge.BadgeId)
            .ToListAsync();

        var unlockedBadgeIdSet = unlockedBadgeIds.ToHashSet();
        var newlyUnlockedBadges = eligibleBadges
            .Where(badge => !unlockedBadgeIdSet.Contains(badge.Id))
            .ToList();

        if (newlyUnlockedBadges.Count == 0)
        {
            return [];
        }

        var unlockedAt = DateTime.UtcNow;
        _context.UserBadges.AddRange(newlyUnlockedBadges.Select(badge => new UserBadge
        {
            UserId = userId,
            BadgeId = badge.Id,
            UnlockedAt = unlockedAt
        }));

        await _context.SaveChangesAsync();

        foreach (var badge in newlyUnlockedBadges)
        {
            _logger.LogInformation(
                "Badge unlocked: {BadgeId} ({BadgeName}) by user {UserId}",
                badge.Id,
                badge.Name,
                userId);
        }

        return newlyUnlockedBadges;
    }
}
