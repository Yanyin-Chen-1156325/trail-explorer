using backend.DTOs.Leaderboard;

namespace backend.Services;

public interface ILeaderboardService
{
    Task<IReadOnlyList<LeaderboardEntryResponse>> GetLeaderboardAsync(int limit = 50);

    Task<int> GetUserRankAsync(Guid userId);

    void InvalidateLeaderboardCache();
}
