using backend.Entities;

namespace backend.Services;

public interface IBadgeEvaluationService
{
    Task<IReadOnlyCollection<Badge>> GetEligibleBadgesAsync(Guid userId);
}
