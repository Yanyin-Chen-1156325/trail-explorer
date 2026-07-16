using backend.Data;
using backend.Entities;
using backend.Enums;
using backend.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;

namespace backend.Tests.Services;

public class BadgeUnlockServiceTests
{
    [Fact]
    public async Task UnlockEligibleBadgesAsync_AddsOnlyNewEligibleBadges()
    {
        using var database = CreateDatabase();
        var user = CreateUser();
        var firstTrailBadge = CreateBadge("First Trail", BadgeType.Completion);
        var distanceBadge = CreateBadge("50km Explorer", BadgeType.Distance);
        database.Context.Users.Add(user);
        database.Context.Badges.AddRange(firstTrailBadge, distanceBadge);
        database.Context.UserBadges.Add(new UserBadge
        {
            UserId = user.Id,
            BadgeId = firstTrailBadge.Id,
            UnlockedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        });
        await database.Context.SaveChangesAsync();
        var evaluationService = new Mock<IBadgeEvaluationService>();
        evaluationService
            .Setup(service => service.GetEligibleBadgesAsync(user.Id))
            .ReturnsAsync([firstTrailBadge, distanceBadge]);
        var service = new BadgeUnlockService(
            database.Context,
            evaluationService.Object,
            Mock.Of<ILogger<BadgeUnlockService>>());

        var unlockedBadges = await service.UnlockEligibleBadgesAsync(user.Id);

        Assert.Single(unlockedBadges);
        Assert.Equal(distanceBadge.Id, unlockedBadges.Single().Id);
        Assert.Equal(2, await database.Context.UserBadges.CountAsync());
        Assert.Contains(
            database.Context.UserBadges,
            userBadge => userBadge.UserId == user.Id && userBadge.BadgeId == distanceBadge.Id);
    }

    [Fact]
    public async Task UnlockEligibleBadgesAsync_WhenNoEligibleBadges_ReturnsEmpty()
    {
        using var database = CreateDatabase();
        var userId = Guid.NewGuid();
        var evaluationService = new Mock<IBadgeEvaluationService>();
        evaluationService
            .Setup(service => service.GetEligibleBadgesAsync(userId))
            .ReturnsAsync([]);
        var service = new BadgeUnlockService(
            database.Context,
            evaluationService.Object,
            Mock.Of<ILogger<BadgeUnlockService>>());

        var unlockedBadges = await service.UnlockEligibleBadgesAsync(userId);

        Assert.Empty(unlockedBadges);
        Assert.Empty(database.Context.UserBadges);
    }

    private static Badge CreateBadge(string name, BadgeType type)
    {
        return new Badge
        {
            Id = Guid.NewGuid(),
            Name = name,
            Description = $"{name} description",
            IconUrl = $"/badges/{name}.svg",
            Type = type
        };
    }

    private static User CreateUser()
    {
        var now = DateTime.UtcNow;

        return new User
        {
            Id = Guid.NewGuid(),
            Email = "badge-user@example.com",
            DisplayName = "Badge User",
            Role = UserRole.User,
            Status = UserStatus.Active,
            AuthProvider = AuthProvider.Local,
            CreatedAt = now,
            UpdatedAt = now
        };
    }

    private static TestDatabase CreateDatabase()
    {
        return new TestDatabase();
    }

    private sealed class TestDatabase : IDisposable
    {
        private readonly SqliteConnection _connection;

        public TestDatabase()
        {
            _connection = new SqliteConnection("Data Source=:memory:");
            _connection.Open();

            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlite(_connection)
                .Options;

            Context = new ApplicationDbContext(options);
            Context.Database.EnsureCreated();
        }

        public ApplicationDbContext Context { get; }

        public void Dispose()
        {
            Context.Dispose();
            _connection.Dispose();
        }
    }
}
