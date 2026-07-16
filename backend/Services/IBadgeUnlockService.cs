using backend.Entities;

namespace backend.Services;

public interface IBadgeUnlockService
{
    Task<IReadOnlyCollection<Badge>> UnlockEligibleBadgesAsync(Guid userId);
}
