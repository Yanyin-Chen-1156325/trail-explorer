using backend.DTOs.Badge;

namespace backend.Services;

public interface IBadgeService
{
    Task<IReadOnlyList<BadgeResponse>> GetUserBadgesAsync(Guid userId);
}
