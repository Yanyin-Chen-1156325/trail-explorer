using backend.DTOs.Leaderboard;
using backend.Entities;
using backend.Enums;
using backend.Hubs;
using backend.Services;
using Microsoft.AspNetCore.SignalR;
using Moq;

namespace backend.Tests.Services;

public class LeaderboardNotificationServiceTests
{
    [Fact]
    public async Task BroadcastLeaderboardChangedAsync_InvalidatesCacheAndBroadcastsUpdates()
    {
        var userId = Guid.NewGuid();
        var leaderboardEntry = new LeaderboardEntryResponse(
            1,
            userId,
            "Trail User",
            250,
            1,
            2,
            20m,
            1);
        var leaderboardService = new Mock<ILeaderboardService>();
        leaderboardService
            .Setup(service => service.GetLeaderboardAsync(50))
            .ReturnsAsync([leaderboardEntry]);
        var clientProxy = new Mock<IClientProxy>();
        var hubClients = new Mock<IHubClients>();
        hubClients.Setup(clients => clients.All).Returns(clientProxy.Object);
        var hubContext = new Mock<IHubContext<LeaderboardHub>>();
        hubContext.Setup(context => context.Clients).Returns(hubClients.Object);
        var service = new LeaderboardNotificationService(
            hubContext.Object,
            leaderboardService.Object);

        await service.BroadcastLeaderboardChangedAsync(userId);

        leaderboardService.Verify(service => service.InvalidateLeaderboardCache(), Times.Once);
        VerifySent(clientProxy, "LeaderboardUpdated");
        VerifySent(clientProxy, "RankingUpdated");
        VerifySent(clientProxy, "XpUpdated");
    }

    [Fact]
    public async Task BroadcastBadgeUnlocksAsync_BroadcastsBadgeAndLeaderboardEvents()
    {
        var userId = Guid.NewGuid();
        var badge = new Badge
        {
            Id = Guid.NewGuid(),
            Name = "First Trail",
            Description = "Complete your first trail.",
            IconUrl = "/badges/first.svg",
            Type = BadgeType.Completion
        };
        var leaderboardService = new Mock<ILeaderboardService>();
        leaderboardService
            .Setup(service => service.GetLeaderboardAsync(50))
            .ReturnsAsync([
                new LeaderboardEntryResponse(
                    1,
                    userId,
                    "Trail User",
                    100,
                    1,
                    1,
                    10m,
                    1)
            ]);
        var clientProxy = new Mock<IClientProxy>();
        var hubClients = new Mock<IHubClients>();
        hubClients.Setup(clients => clients.All).Returns(clientProxy.Object);
        var hubContext = new Mock<IHubContext<LeaderboardHub>>();
        hubContext.Setup(context => context.Clients).Returns(hubClients.Object);
        var service = new LeaderboardNotificationService(
            hubContext.Object,
            leaderboardService.Object);

        await service.BroadcastBadgeUnlocksAsync(
            userId,
            [badge],
            new DateTime(2026, 7, 16, 8, 0, 0, DateTimeKind.Utc));

        VerifySent(clientProxy, "BadgeUnlocked");
        VerifySent(clientProxy, "LeaderboardUpdated");
        VerifySent(clientProxy, "RankingUpdated");
        VerifySent(clientProxy, "XpUpdated");
    }

    private static void VerifySent(Mock<IClientProxy> clientProxy, string methodName)
    {
        clientProxy.Verify(
            proxy => proxy.SendCoreAsync(
                methodName,
                It.IsAny<object?[]>(),
                It.IsAny<CancellationToken>()),
            Times.AtLeastOnce);
    }
}
