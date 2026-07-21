using backend.Data;
using backend.Entities;
using backend.Enums;
using backend.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace backend.Tests.Services;

public class DashboardServiceTests
{
    [Fact]
    public async Task GetDashboardAsync_ReturnsUserSummaryStatisticsAndRecentActivity()
    {
        using var database = CreateDatabase();
        var user = CreateUser("dashboard.user@example.com");
        var otherUser = CreateUser("other.dashboard.user@example.com");
        var firstTrail = CreateTrail("First Trail", "Canterbury", 5m, TrailDifficulty.Easy);
        var secondTrail = CreateTrail("Second Trail", "Port Hills", 10m, TrailDifficulty.Advanced);
        var hiddenTrail = CreateTrail("Hidden Trail", "Canterbury", 20m, TrailDifficulty.Advanced);
        var badge = CreateBadge("First Trail Badge");
        database.Context.Users.AddRange(user, otherUser);
        database.Context.Trails.AddRange(firstTrail, secondTrail, hiddenTrail);
        database.Context.Badges.Add(badge);
        database.Context.CheckIns.AddRange(
            CreateCheckIn(user.Id, firstTrail.Id, new DateTime(2026, 7, 15, 8, 0, 0, DateTimeKind.Utc)),
            CreateCheckIn(user.Id, secondTrail.Id, new DateTime(2026, 7, 8, 8, 0, 0, DateTimeKind.Utc)),
            CreateCheckIn(user.Id, hiddenTrail.Id, new DateTime(2026, 7, 1, 8, 0, 0, DateTimeKind.Utc), isHidden: true),
            CreateCheckIn(otherUser.Id, hiddenTrail.Id, new DateTime(2026, 7, 15, 8, 0, 0, DateTimeKind.Utc)));
        database.Context.UserBadges.Add(new UserBadge
        {
            UserId = user.Id,
            BadgeId = badge.Id,
            UnlockedAt = new DateTime(2026, 7, 15, 9, 0, 0, DateTimeKind.Utc)
        });
        await database.Context.SaveChangesAsync();
        var service = CreateService(
            database.Context,
            new DateTimeOffset(2026, 7, 16, 12, 0, 0, TimeSpan.Zero));

        var dashboard = await service.GetDashboardAsync(user.Id);

        Assert.Equal(200, dashboard.Progress.TotalXp);
        Assert.Equal(2, dashboard.UserSummary.CompletedTrails);
        Assert.Equal(15m, dashboard.UserSummary.TotalDistanceKm);
        Assert.Equal(1, dashboard.UserSummary.UnlockedBadges);
        Assert.Equal(2, dashboard.TrailStatistics.CompletedTrails);
        Assert.Equal(2, dashboard.TrailStatistics.UniqueTrailsCompleted);
        Assert.Equal(2, dashboard.TrailStatistics.RegionsExplored);
        Assert.Equal(15m, dashboard.DistanceStatistics.TotalDistanceKm);
        Assert.Equal(7.5m, dashboard.DistanceStatistics.AverageDistanceKm);
        Assert.Equal(10m, dashboard.DistanceStatistics.LongestTrailDistanceKm);
        Assert.Equal(2, dashboard.WeeklyStreak);
        Assert.Equal(2, dashboard.LeaderboardRank);
        Assert.Single(dashboard.RecentBadges);
        Assert.Equal("First Trail Badge", dashboard.RecentBadges[0].Name);
        Assert.Equal(2, dashboard.RecentCheckIns.Count);
        Assert.Equal("First Trail", dashboard.RecentCheckIns[0].TrailName);
    }

    [Fact]
    public async Task GetDashboardAsync_WithNoActivity_ReturnsEmptyStatistics()
    {
        using var database = CreateDatabase();
        var user = CreateUser();
        database.Context.Users.Add(user);
        await database.Context.SaveChangesAsync();
        var service = CreateService(
            database.Context,
            new DateTimeOffset(2026, 7, 16, 12, 0, 0, TimeSpan.Zero));

        var dashboard = await service.GetDashboardAsync(user.Id);

        Assert.Equal(0, dashboard.Progress.TotalXp);
        Assert.Equal(0, dashboard.UserSummary.CompletedTrails);
        Assert.Equal(0m, dashboard.DistanceStatistics.TotalDistanceKm);
        Assert.Equal(0m, dashboard.DistanceStatistics.AverageDistanceKm);
        Assert.Equal(0, dashboard.WeeklyStreak);
        Assert.Equal(1, dashboard.LeaderboardRank);
        Assert.Empty(dashboard.RecentBadges);
        Assert.Empty(dashboard.RecentCheckIns);
    }

    private static DashboardService CreateService(
        ApplicationDbContext context,
        DateTimeOffset utcNow)
    {
        var xpCalculatorService = new XpCalculatorService();
        var levelCalculatorService = new LevelCalculatorService();

        return new DashboardService(
            context,
            xpCalculatorService,
            levelCalculatorService,
            new StreakCalculatorService(),
            new LeaderboardService(
                context,
                xpCalculatorService,
                levelCalculatorService,
                new MemoryCache(new MemoryCacheOptions())),
            new FixedTimeProvider(utcNow));
    }

    private static User CreateUser(string email = "user@example.com")
    {
        var now = DateTime.UtcNow;

        return new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            DisplayName = "Test User",
            Role = UserRole.User,
            Status = UserStatus.Active,
            AuthProvider = AuthProvider.Local,
            CreatedAt = now,
            UpdatedAt = now
        };
    }

    private static Trail CreateTrail(
        string name,
        string region,
        decimal distanceKm,
        TrailDifficulty difficulty)
    {
        var now = DateTime.UtcNow;

        return new Trail
        {
            Id = Guid.NewGuid(),
            DocId = $"doc-{Guid.NewGuid():N}",
            Name = name,
            City = "Christchurch",
            Region = region,
            Difficulty = difficulty,
            DistanceKm = distanceKm,
            Description = $"{name} description",
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };
    }

    private static CheckIn CreateCheckIn(
        Guid userId,
        Guid trailId,
        DateTime completedDate,
        bool isHidden = false)
    {
        return new CheckIn
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TrailId = trailId,
            CompletedDate = completedDate,
            IsHidden = isHidden
        };
    }

    private static Badge CreateBadge(string name)
    {
        return new Badge
        {
            Id = Guid.NewGuid(),
            Name = name,
            Description = $"{name} description",
            IconUrl = "/badges/test.svg",
            Type = BadgeType.Completion
        };
    }

    private static TestDatabase CreateDatabase()
    {
        return new TestDatabase();
    }

    private sealed class FixedTimeProvider : TimeProvider
    {
        private readonly DateTimeOffset _utcNow;

        public FixedTimeProvider(DateTimeOffset utcNow)
        {
            _utcNow = utcNow;
        }

        public override DateTimeOffset GetUtcNow()
        {
            return _utcNow;
        }
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
