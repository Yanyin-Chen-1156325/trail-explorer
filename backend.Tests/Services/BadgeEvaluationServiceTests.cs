using backend.Data;
using backend.Entities;
using backend.Enums;
using backend.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace backend.Tests.Services;

public class BadgeEvaluationServiceTests
{
    [Fact]
    public async Task GetEligibleBadgesAsync_ReturnsCompletionDistanceRegionDifficultyAndStreakBadges()
    {
        using var database = CreateDatabase();
        var user = CreateUser();
        database.Context.Users.Add(user);
        database.Context.Badges.AddRange(CreateBadges());

        var portHillsTrail = CreateTrail("Port Hills Trail", "Port Hills", 25m, TrailDifficulty.Hard);
        var banksTrail = CreateTrail("Banks Trail", "Banks Peninsula", 25m, TrailDifficulty.Moderate);
        var canterburyTrail = CreateTrail("Canterbury Trail", "Canterbury Foothills", 10m, TrailDifficulty.Easy);
        database.Context.Trails.AddRange(portHillsTrail, banksTrail, canterburyTrail);
        database.Context.CheckIns.AddRange(
            CreateCheckIn(user.Id, portHillsTrail.Id, new DateTime(2026, 1, 12, 8, 0, 0, DateTimeKind.Utc)),
            CreateCheckIn(user.Id, banksTrail.Id, new DateTime(2026, 1, 19, 8, 0, 0, DateTimeKind.Utc)),
            CreateCheckIn(user.Id, canterburyTrail.Id, new DateTime(2026, 1, 20, 8, 0, 0, DateTimeKind.Utc)));
        await database.Context.SaveChangesAsync();
        var service = new BadgeEvaluationService(database.Context);

        var badges = await service.GetEligibleBadgesAsync(user.Id);

        Assert.Contains(badges, badge => badge.Name == "First Trail");
        Assert.Contains(badges, badge => badge.Name == "50km Explorer");
        Assert.Contains(badges, badge => badge.Name == "Port Hills Explorer");
        Assert.Contains(badges, badge => badge.Name == "Banks Peninsula Explorer");
        Assert.Contains(badges, badge => badge.Name == "Canterbury Explorer");
        Assert.Contains(badges, badge => badge.Name == "Advanced Explorer");
        Assert.Contains(badges, badge => badge.Name == "Expert Explorer");
        Assert.Contains(badges, badge => badge.Name == "2 Week Streak");
    }

    [Fact]
    public async Task GetEligibleBadgesAsync_ExcludesHiddenCheckIns()
    {
        using var database = CreateDatabase();
        var user = CreateUser();
        var trail = CreateTrail("Hidden Trail", "Port Hills", 100m, TrailDifficulty.Hard);
        database.Context.Users.Add(user);
        database.Context.Trails.Add(trail);
        database.Context.Badges.AddRange(CreateBadges());
        database.Context.CheckIns.Add(CreateCheckIn(
            user.Id,
            trail.Id,
            new DateTime(2026, 1, 12, 8, 0, 0, DateTimeKind.Utc),
            isHidden: true));
        await database.Context.SaveChangesAsync();
        var service = new BadgeEvaluationService(database.Context);

        var badges = await service.GetEligibleBadgesAsync(user.Id);

        Assert.Empty(badges);
    }

    private static IReadOnlyList<Badge> CreateBadges()
    {
        return BadgeRuleCatalog.BadgeDefinitions
            .Select(definition => new Badge
            {
                Id = Guid.NewGuid(),
                Name = definition.Name,
                Description = definition.Description,
                IconUrl = definition.IconUrl,
                Type = definition.Type
            })
            .ToList();
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
            DocId = Guid.NewGuid().ToString("N"),
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
