using backend.DTOs.Leaderboard;
using backend.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace backend.Services;

public class LeaderboardNotificationService : ILeaderboardNotificationService
{
    private readonly IHubContext<LeaderboardHub> _hubContext;
    private readonly ILeaderboardService _leaderboardService;

    public LeaderboardNotificationService(
        IHubContext<LeaderboardHub> hubContext,
        ILeaderboardService leaderboardService)
    {
        _hubContext = hubContext;
        _leaderboardService = leaderboardService;
    }

    public async Task BroadcastLeaderboardChangedAsync(Guid userId)
    {
        _leaderboardService.InvalidateLeaderboardCache();

        var leaderboard = await _leaderboardService.GetLeaderboardAsync();
        var userEntry = leaderboard.FirstOrDefault(entry => entry.UserId == userId);
        var rank = userEntry?.Rank ?? await _leaderboardService.GetUserRankAsync(userId);

        await _hubContext.Clients.All.SendAsync("LeaderboardUpdated", leaderboard);
        await _hubContext.Clients.All.SendAsync(
            "RankingUpdated",
            new LeaderboardRankingUpdateResponse(userId, rank));

        if (userEntry is not null)
        {
            await _hubContext.Clients.All.SendAsync(
                "XpUpdated",
                new LeaderboardXpUpdateResponse(
                    userId,
                    userEntry.TotalXp,
                    userEntry.CurrentLevel,
                    userEntry.Rank));
        }
    }

    public async Task BroadcastBadgeUnlocksAsync(
        Guid userId,
        IReadOnlyCollection<Entities.Badge> badges,
        DateTime unlockedAt)
    {
        if (badges.Count == 0)
        {
            return;
        }

        _leaderboardService.InvalidateLeaderboardCache();

        foreach (var badge in badges)
        {
            await _hubContext.Clients.All.SendAsync(
                "BadgeUnlocked",
                new LeaderboardBadgeUnlockResponse(
                    userId,
                    badge.Id,
                    badge.Name,
                    badge.Description,
                    badge.IconUrl,
                    badge.Type,
                    unlockedAt));
        }

        await BroadcastLeaderboardChangedAsync(userId);
    }
}
