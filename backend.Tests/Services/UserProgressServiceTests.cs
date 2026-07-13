using backend.Data;
using backend.Entities;
using backend.Enums;
using backend.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace backend.Tests.Services;

public class UserProgressServiceTests
{
    [Fact]
    public async Task GetUserProgressAsync_WithVisibleCheckIns_ReturnsTotalXpAndLevelProgress()
    {
        using var database = CreateDatabase();
        var user = CreateUser();
        var easyTrail = CreateTrail("Easy Trail", 5m, TrailDifficulty.Easy);
        var hardTrail = CreateTrail("Hard Trail", 10m, TrailDifficulty.Hard);
        database.Context.Users.Add(user);
        database.Context.Trails.AddRange(easyTrail, hardTrail);
        database.Context.CheckIns.AddRange(
            CreateCheckIn(user.Id, easyTrail.Id),
            CreateCheckIn(user.Id, hardTrail.Id));
        await database.Context.SaveChangesAsync();
        var service = CreateService(database.Context);

        var progress = await service.GetUserProgressAsync(user.Id);

        Assert.Equal(200, progress.TotalXp);
        Assert.Equal(1, progress.CurrentLevel);
        Assert.Equal(0, progress.CurrentLevelMinimumXp);
        Assert.Equal(2, progress.NextLevel);
        Assert.Equal(500, progress.NextLevelMinimumXp);
        Assert.Equal(200, progress.XpIntoCurrentLevel);
        Assert.Equal(500, progress.XpRequiredForNextLevel);
        Assert.Equal(40m, progress.ProgressPercent);
    }

    [Fact]
    public async Task GetUserProgressAsync_ExcludesHiddenAndOtherUserCheckIns()
    {
        using var database = CreateDatabase();
        var user = CreateUser("user@example.com");
        var otherUser = CreateUser("other@example.com");
        var trail = CreateTrail("Shared Trail", 10m, TrailDifficulty.Moderate);
        database.Context.Users.AddRange(user, otherUser);
        database.Context.Trails.Add(trail);
        database.Context.CheckIns.AddRange(
            CreateCheckIn(user.Id, trail.Id),
            CreateCheckIn(user.Id, trail.Id, isHidden: true),
            CreateCheckIn(otherUser.Id, trail.Id));
        await database.Context.SaveChangesAsync();
        var service = CreateService(database.Context);

        var progress = await service.GetUserProgressAsync(user.Id);

        Assert.Equal(120, progress.TotalXp);
    }

    [Fact]
    public async Task GetUserProgressAsync_WithNoCheckIns_ReturnsLevelOneProgress()
    {
        using var database = CreateDatabase();
        var user = CreateUser();
        database.Context.Users.Add(user);
        await database.Context.SaveChangesAsync();
        var service = CreateService(database.Context);

        var progress = await service.GetUserProgressAsync(user.Id);

        Assert.Equal(0, progress.TotalXp);
        Assert.Equal(1, progress.CurrentLevel);
        Assert.Equal(0, progress.CurrentLevelMinimumXp);
        Assert.Equal(2, progress.NextLevel);
        Assert.Equal(500, progress.NextLevelMinimumXp);
        Assert.Equal(0, progress.XpIntoCurrentLevel);
        Assert.Equal(500, progress.XpRequiredForNextLevel);
        Assert.Equal(0m, progress.ProgressPercent);
    }

    private static UserProgressService CreateService(ApplicationDbContext context)
    {
        return new UserProgressService(
            context,
            new XpCalculatorService(),
            new LevelCalculatorService());
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
        decimal distanceKm,
        TrailDifficulty difficulty)
    {
        var now = DateTime.UtcNow;

        return new Trail
        {
            Id = Guid.NewGuid(),
            DocId = $"doc-{Guid.NewGuid():N}",
            Name = name,
            City = "Canterbury",
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
            CompletedDate = new DateTime(2026, 1, 10, 8, 0, 0, DateTimeKind.Utc),
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
