using backend.Data;
using backend.Entities;
using backend.Enums;
using backend.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace backend.Tests.Services;

public class LeaderboardServiceTests
{
    [Fact]
    public async Task GetLeaderboardAsync_RanksUsersByXpCompletionsThenDistance()
    {
        using var database = CreateDatabase();
        var highXpUser = CreateUser("High XP");
        var tieMoreCompletionsUser = CreateUser("Tie More Completions");
        var tieMoreDistanceUser = CreateUser("Tie More Distance");
        var hiddenOnlyUser = CreateUser("Hidden Only");
        var hardTrail = CreateTrail("Hard Trail", 10m, TrailDifficulty.Advanced);
        var moderateTrail = CreateTrail("Moderate Trail", 10m, TrailDifficulty.Intermediate);
        var shortEasyTrail = CreateTrail("Short Easy Trail", 5m, TrailDifficulty.Easy);
        var longEasyTrail = CreateTrail("Long Easy Trail", 10m, TrailDifficulty.Easy);
        database.Context.Users.AddRange(
            highXpUser,
            tieMoreCompletionsUser,
            tieMoreDistanceUser,
            hiddenOnlyUser);
        database.Context.Trails.AddRange(
            hardTrail,
            moderateTrail,
            shortEasyTrail,
            longEasyTrail);
        database.Context.CheckIns.AddRange(
            CreateCheckIn(highXpUser.Id, hardTrail.Id),
            CreateCheckIn(tieMoreCompletionsUser.Id, shortEasyTrail.Id),
            CreateCheckIn(tieMoreCompletionsUser.Id, shortEasyTrail.Id),
            CreateCheckIn(tieMoreDistanceUser.Id, longEasyTrail.Id),
            CreateCheckIn(hiddenOnlyUser.Id, hardTrail.Id, isHidden: true));
        await database.Context.SaveChangesAsync();
        var service = CreateService(database.Context);

        var leaderboard = await service.GetLeaderboardAsync();

        Assert.Equal("High XP", leaderboard[0].DisplayName);
        Assert.Equal(150, leaderboard[0].TotalXp);
        Assert.Equal("Tie More Completions", leaderboard[1].DisplayName);
        Assert.Equal(2, leaderboard[1].CompletedTrails);
        Assert.Equal("Tie More Distance", leaderboard[2].DisplayName);
        Assert.Equal(10m, leaderboard[2].TotalDistanceKm);
        Assert.Equal("Hidden Only", leaderboard[3].DisplayName);
        Assert.Equal(0, leaderboard[3].TotalXp);
        Assert.Equal([1, 2, 3, 4], leaderboard.Select(entry => entry.Rank).ToArray());
    }

    [Fact]
    public async Task GetLeaderboardAsync_ClampsLimit()
    {
        using var database = CreateDatabase();
        database.Context.Users.AddRange(
            CreateUser("First"),
            CreateUser("Second"));
        await database.Context.SaveChangesAsync();
        var service = CreateService(database.Context);

        var leaderboard = await service.GetLeaderboardAsync(1);

        Assert.Single(leaderboard);
    }

    [Fact]
    public async Task GetUserRankAsync_ReturnsCurrentUserRank()
    {
        using var database = CreateDatabase();
        var topUser = CreateUser("Top");
        var secondUser = CreateUser("Second");
        var trail = CreateTrail("Trail", 10m, TrailDifficulty.Easy);
        database.Context.Users.AddRange(topUser, secondUser);
        database.Context.Trails.Add(trail);
        database.Context.CheckIns.AddRange(
            CreateCheckIn(topUser.Id, trail.Id),
            CreateCheckIn(secondUser.Id, trail.Id, isHidden: true));
        await database.Context.SaveChangesAsync();
        var service = CreateService(database.Context);

        var rank = await service.GetUserRankAsync(secondUser.Id);

        Assert.Equal(2, rank);
    }

    [Fact]
    public async Task GetLeaderboardAsync_ExcludesAdminAndModeratorUsers()
    {
        using var database = CreateDatabase();
        var user = CreateUser("Regular User");
        var admin = CreateUser("Admin User", UserRole.Admin);
        var moderator = CreateUser("Moderator User", UserRole.Moderator);
        var trail = CreateTrail("High XP Trail", 20m, TrailDifficulty.Advanced);
        database.Context.Users.AddRange(user, admin, moderator);
        database.Context.Trails.Add(trail);
        database.Context.CheckIns.AddRange(
            CreateCheckIn(user.Id, trail.Id),
            CreateCheckIn(admin.Id, trail.Id),
            CreateCheckIn(moderator.Id, trail.Id));
        await database.Context.SaveChangesAsync();
        var service = CreateService(database.Context);

        var leaderboard = await service.GetLeaderboardAsync();
        var adminRank = await service.GetUserRankAsync(admin.Id);
        var moderatorRank = await service.GetUserRankAsync(moderator.Id);

        Assert.Single(leaderboard);
        Assert.Equal(user.Id, leaderboard[0].UserId);
        Assert.Equal(0, adminRank);
        Assert.Equal(0, moderatorRank);
    }

    [Fact]
    public async Task InvalidateLeaderboardCache_ClearsCachedRanking()
    {
        using var database = CreateDatabase();
        var user = CreateUser("User");
        var trail = CreateTrail("Trail", 10m, TrailDifficulty.Easy);
        database.Context.Users.Add(user);
        database.Context.Trails.Add(trail);
        await database.Context.SaveChangesAsync();
        var service = CreateService(database.Context);

        var initialLeaderboard = await service.GetLeaderboardAsync();
        database.Context.CheckIns.Add(CreateCheckIn(user.Id, trail.Id));
        await database.Context.SaveChangesAsync();
        var cachedLeaderboard = await service.GetLeaderboardAsync();

        service.InvalidateLeaderboardCache();
        var refreshedLeaderboard = await service.GetLeaderboardAsync();

        Assert.Equal(0, initialLeaderboard[0].TotalXp);
        Assert.Equal(0, cachedLeaderboard[0].TotalXp);
        Assert.Equal(100, refreshedLeaderboard[0].TotalXp);
    }

    private static LeaderboardService CreateService(ApplicationDbContext context)
    {
        return new LeaderboardService(
            context,
            new XpCalculatorService(),
            new LevelCalculatorService(),
            new MemoryCache(new MemoryCacheOptions()));
    }

    private static User CreateUser(
        string displayName,
        UserRole role = UserRole.User)
    {
        var now = DateTime.UtcNow;

        return new User
        {
            Id = Guid.NewGuid(),
            Email = $"{Guid.NewGuid():N}@example.com",
            DisplayName = displayName,
            Role = role,
            Status = UserStatus.Active,
            AuthProvider = AuthProvider.Local,
            CreatedAt = now,
            UpdatedAt = now
        };
    }

    private static Trail CreateTrail(
        string name,
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
            Region = "Canterbury",
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
        bool isHidden = false)
    {
        return new CheckIn
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TrailId = trailId,
            CompletedDate = new DateTime(2026, 7, 16, 8, 0, 0, DateTimeKind.Utc),
            IsHidden = isHidden
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
