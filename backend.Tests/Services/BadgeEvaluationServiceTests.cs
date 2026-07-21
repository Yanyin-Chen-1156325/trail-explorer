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

        var portHillsTrail = CreateTrail("Port Hills Trail", "Port Hills", 25m, TrailDifficulty.Advanced);
        var banksTrail = CreateTrail("Banks Trail", "Banks Peninsula", 25m, TrailDifficulty.Intermediate);
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
        Assert.DoesNotContain(badges, badge => badge.Name == "Expert Explorer");
        Assert.Contains(badges, badge => badge.Name == "2 Week Streak");
    }

    [Fact]
    public async Task GetEligibleBadgesAsync_UsesOnlyExpertTrailsForExpertThresholds()
    {
        using var database = CreateDatabase();
        var user = CreateUser();
        var expertTrail = CreateTrail(
            "Expert Trail",
            "Canterbury",
            10m,
            TrailDifficulty.Expert);
        database.Context.Users.Add(user);
        database.Context.Trails.Add(expertTrail);
        database.Context.Badges.AddRange(CreateBadges());
        database.Context.CheckIns.AddRange(Enumerable.Range(0, 10).Select(index =>
            CreateCheckIn(
                user.Id,
                expertTrail.Id,
                new DateTime(2026, 1, 1, 8, 0, 0, DateTimeKind.Utc).AddDays(index))));
        await database.Context.SaveChangesAsync();
        var service = new BadgeEvaluationService(database.Context);

        var badges = await service.GetEligibleBadgesAsync(user.Id);

        Assert.Contains(badges, badge => badge.Name == "Expert Explorer");
        Assert.Contains(badges, badge => badge.Name == "Expert Specialist");
        Assert.Contains(badges, badge => badge.Name == "Expert Master");
        Assert.DoesNotContain(badges, badge => badge.Name == "Advanced Explorer");
    }

    [Fact]
    public async Task GetUserBadgesAsync_ReportsSeparateAdvancedAndExpertProgress()
    {
        using var database = CreateDatabase();
        var user = CreateUser();
        var advancedTrail = CreateTrail(
            "Advanced Trail",
            "Canterbury",
            10m,
            TrailDifficulty.Advanced);
        var expertTrail = CreateTrail(
            "Expert Trail",
            "Canterbury",
            10m,
            TrailDifficulty.Expert);
        database.Context.Users.Add(user);
        database.Context.Trails.AddRange(advancedTrail, expertTrail);
        database.Context.Badges.AddRange(CreateBadges());
        var advancedCheckIns = Enumerable.Range(0, 2).Select(index => CreateCheckIn(
                user.Id,
                advancedTrail.Id,
                new DateTime(2026, 1, 1, 8, 0, 0, DateTimeKind.Utc).AddDays(index)));
        var expertCheckIns = Enumerable.Range(0, 5).Select(index => CreateCheckIn(
                user.Id,
                expertTrail.Id,
                new DateTime(2026, 2, 1, 8, 0, 0, DateTimeKind.Utc).AddDays(index)));
        database.Context.CheckIns.AddRange(advancedCheckIns.Concat(expertCheckIns));
        await database.Context.SaveChangesAsync();
        var service = new BadgeService(database.Context);

        var badges = await service.GetUserBadgesAsync(user.Id);

        var advancedBadge = Assert.Single(
            badges,
            badge => badge.Name == "Advanced Explorer");
        Assert.Equal(2m, advancedBadge.CurrentValue);
        Assert.Equal(1m, advancedBadge.TargetValue);
        Assert.Equal("2/1 advanced trails", advancedBadge.ProgressLabel);

        var expertBadge = Assert.Single(
            badges,
            badge => badge.Name == "Expert Specialist");
        Assert.Equal(5m, expertBadge.CurrentValue);
        Assert.Equal(5m, expertBadge.TargetValue);
        Assert.Equal("5/5 expert trails", expertBadge.ProgressLabel);
    }

    [Fact]
    public async Task GetEligibleBadgesAsync_ExcludesHiddenCheckIns()
    {
        using var database = CreateDatabase();
        var user = CreateUser();
        var trail = CreateTrail("Hidden Trail", "Port Hills", 100m, TrailDifficulty.Advanced);
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
