using backend.Entities;

namespace backend.Services;

public interface ILeaderboardNotificationService
{
    Task BroadcastLeaderboardChangedAsync(Guid userId);

    Task BroadcastBadgeUnlocksAsync(Guid userId, IReadOnlyCollection<Badge> badges, DateTime unlockedAt);
}
