using backend.Data;
using backend.DTOs.CheckIn;
using backend.Entities;
using backend.Enums;
using backend.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;

namespace backend.Tests.Services;

public class CheckInServiceTests
{
    [Fact]
    public async Task CreateCheckInAsync_WithActiveTrail_CreatesCheckInAndTrimsTextFields()
    {
        using var database = CreateDatabase();
        var user = CreateUser();
        var trail = CreateTrail();
        database.Context.Users.Add(user);
        database.Context.Trails.Add(trail);
        await database.Context.SaveChangesAsync();
        var service = CreateService(database.Context);

        var response = await service.CreateCheckInAsync(user.Id, new CreateCheckInRequest
        {
            TrailId = trail.Id,
            CompletedDate = new DateTime(2026, 1, 5, 10, 0, 0, DateTimeKind.Utc),
            Notes = "  Great views  ",
            PhotoUrl = "  https://example.com/photo.jpg  "
        });

        var savedCheckIn = await database.Context.CheckIns.SingleAsync();
        Assert.Equal(user.Id, savedCheckIn.UserId);
        Assert.Equal(trail.Id, savedCheckIn.TrailId);
        Assert.Equal("Great views", savedCheckIn.Notes);
        Assert.Equal("https://example.com/photo.jpg", savedCheckIn.PhotoUrl);
        Assert.False(savedCheckIn.IsHidden);
        Assert.Equal(savedCheckIn.Id, response.Id);
        Assert.Equal("Great views", response.Notes);
    }

    [Fact]
    public async Task CreateCheckInAsync_WhenTrailDoesNotExist_ThrowsKeyNotFoundException()
    {
        using var database = CreateDatabase();
        var service = CreateService(database.Context);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => service.CreateCheckInAsync(Guid.NewGuid(), new CreateCheckInRequest
        {
            TrailId = Guid.NewGuid(),
            CompletedDate = new DateTime(2026, 1, 5, 10, 0, 0, DateTimeKind.Utc)
        }));
    }

    [Fact]
    public async Task CreateCheckInAsync_WhenTrailIsInactive_ThrowsKeyNotFoundException()
    {
        using var database = CreateDatabase();
        var trail = CreateTrail(isActive: false);
        database.Context.Trails.Add(trail);
        await database.Context.SaveChangesAsync();
        var service = CreateService(database.Context);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => service.CreateCheckInAsync(Guid.NewGuid(), new CreateCheckInRequest
        {
            TrailId = trail.Id,
            CompletedDate = new DateTime(2026, 1, 5, 10, 0, 0, DateTimeKind.Utc)
        }));
    }

    [Fact]
    public async Task UpdateCheckInAsync_WhenOwner_UpdatesCheckInAndTrimsTextFields()
    {
        using var database = CreateDatabase();
        var user = CreateUser();
        var trail = CreateTrail();
        var checkIn = CreateCheckIn(user.Id, trail.Id);
        database.Context.Users.Add(user);
        database.Context.Trails.Add(trail);
        database.Context.CheckIns.Add(checkIn);
        await database.Context.SaveChangesAsync();
        var service = CreateService(database.Context);
        var completedDate = new DateTime(2026, 2, 10, 9, 30, 0, DateTimeKind.Utc);

        var response = await service.UpdateCheckInAsync(checkIn.Id, user.Id, new UpdateCheckInRequest
        {
            CompletedDate = completedDate,
            Notes = "  Updated notes  ",
            PhotoUrl = "  https://example.com/updated.jpg  "
        });

        var savedCheckIn = await database.Context.CheckIns.FindAsync(checkIn.Id);
        Assert.NotNull(savedCheckIn);
        Assert.Equal(completedDate, savedCheckIn.CompletedDate);
        Assert.Equal("Updated notes", savedCheckIn.Notes);
        Assert.Equal("https://example.com/updated.jpg", savedCheckIn.PhotoUrl);
        Assert.Equal("Updated notes", response.Notes);
    }

    [Fact]
    public async Task UpdateCheckInAsync_WhenNotOwner_ThrowsUnauthorizedAccessException()
    {
        using var database = CreateDatabase();
        var owner = CreateUser("owner@example.com");
        var otherUser = CreateUser("other@example.com");
        var trail = CreateTrail();
        var checkIn = CreateCheckIn(owner.Id, trail.Id);
        database.Context.Users.AddRange(owner, otherUser);
        database.Context.Trails.Add(trail);
        database.Context.CheckIns.Add(checkIn);
        await database.Context.SaveChangesAsync();
        var service = CreateService(database.Context);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => service.UpdateCheckInAsync(checkIn.Id, otherUser.Id, new UpdateCheckInRequest
        {
            CompletedDate = new DateTime(2026, 2, 10, 9, 30, 0, DateTimeKind.Utc),
            Notes = "Updated notes"
        }));
    }

    [Fact]
    public async Task DeleteCheckInAsync_WhenOwner_RemovesCheckIn()
    {
        using var database = CreateDatabase();
        var user = CreateUser();
        var trail = CreateTrail();
        var checkIn = CreateCheckIn(user.Id, trail.Id);
        database.Context.Users.Add(user);
        database.Context.Trails.Add(trail);
        database.Context.CheckIns.Add(checkIn);
        await database.Context.SaveChangesAsync();
        var service = CreateService(database.Context);

        await service.DeleteCheckInAsync(checkIn.Id, user.Id);

        Assert.Empty(database.Context.CheckIns);
    }

    [Fact]
    public async Task DeleteCheckInAsync_WhenNotOwner_ThrowsUnauthorizedAccessException()
    {
        using var database = CreateDatabase();
        var owner = CreateUser("owner@example.com");
        var otherUser = CreateUser("other@example.com");
        var trail = CreateTrail();
        var checkIn = CreateCheckIn(owner.Id, trail.Id);
        database.Context.Users.AddRange(owner, otherUser);
        database.Context.Trails.Add(trail);
        database.Context.CheckIns.Add(checkIn);
        await database.Context.SaveChangesAsync();
        var service = CreateService(database.Context);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => service.DeleteCheckInAsync(checkIn.Id, otherUser.Id));

        Assert.Single(database.Context.CheckIns);
    }

    [Fact]
    public async Task GetUserCheckInHistoryAsync_ReturnsOnlyVisibleUserCheckInsOrderedNewestFirst()
    {
        using var database = CreateDatabase();
        var user = CreateUser("user@example.com");
        var otherUser = CreateUser("other@example.com");
        var trail = CreateTrail();
        var older = CreateCheckIn(user.Id, trail.Id, completedDate: new DateTime(2026, 1, 1, 8, 0, 0, DateTimeKind.Utc));
        var newer = CreateCheckIn(user.Id, trail.Id, completedDate: new DateTime(2026, 2, 1, 8, 0, 0, DateTimeKind.Utc));
        var hidden = CreateCheckIn(user.Id, trail.Id, completedDate: new DateTime(2026, 3, 1, 8, 0, 0, DateTimeKind.Utc), isHidden: true);
        var otherUserCheckIn = CreateCheckIn(otherUser.Id, trail.Id, completedDate: new DateTime(2026, 4, 1, 8, 0, 0, DateTimeKind.Utc));
        database.Context.Users.AddRange(user, otherUser);
        database.Context.Trails.Add(trail);
        database.Context.CheckIns.AddRange(older, newer, hidden, otherUserCheckIn);
        await database.Context.SaveChangesAsync();
        var service = CreateService(database.Context);

        var response = await service.GetUserCheckInHistoryAsync(user.Id);

        Assert.Equal([newer.Id, older.Id], response.Select(checkIn => checkIn.Id));
    }

    [Fact]
    public async Task GetAllCheckInsAsync_ReturnsAllCheckInsOrderedNewestFirst()
    {
        using var database = CreateDatabase();
        var user = CreateUser();
        var trail = CreateTrail();
        var older = CreateCheckIn(user.Id, trail.Id, completedDate: new DateTime(2026, 1, 1, 8, 0, 0, DateTimeKind.Utc));
        var newerHidden = CreateCheckIn(user.Id, trail.Id, completedDate: new DateTime(2026, 2, 1, 8, 0, 0, DateTimeKind.Utc), isHidden: true);
        database.Context.Users.Add(user);
        database.Context.Trails.Add(trail);
        database.Context.CheckIns.AddRange(older, newerHidden);
        await database.Context.SaveChangesAsync();
        var service = CreateService(database.Context);

        var response = await service.GetAllCheckInsAsync();

        Assert.Equal([newerHidden.Id, older.Id], response.Select(checkIn => checkIn.Id));
        Assert.True(response[0].IsHidden);
    }

    [Fact]
    public async Task HideCheckInAsync_SetsIsHiddenTrue()
    {
        using var database = CreateDatabase();
        var user = CreateUser();
        var trail = CreateTrail();
        var checkIn = CreateCheckIn(user.Id, trail.Id);
        database.Context.Users.Add(user);
        database.Context.Trails.Add(trail);
        database.Context.CheckIns.Add(checkIn);
        await database.Context.SaveChangesAsync();
        var service = CreateService(database.Context);

        var response = await service.HideCheckInAsync(checkIn.Id);

        var savedCheckIn = await database.Context.CheckIns.FindAsync(checkIn.Id);
        Assert.NotNull(savedCheckIn);
        Assert.True(savedCheckIn.IsHidden);
        Assert.True(response.IsHidden);
    }

    [Fact]
    public async Task RestoreCheckInAsync_SetsIsHiddenFalse()
    {
        using var database = CreateDatabase();
        var user = CreateUser();
        var trail = CreateTrail();
        var checkIn = CreateCheckIn(user.Id, trail.Id, isHidden: true);
        database.Context.Users.Add(user);
        database.Context.Trails.Add(trail);
        database.Context.CheckIns.Add(checkIn);
        await database.Context.SaveChangesAsync();
        var service = CreateService(database.Context);

        var response = await service.RestoreCheckInAsync(checkIn.Id);

        var savedCheckIn = await database.Context.CheckIns.FindAsync(checkIn.Id);
        Assert.NotNull(savedCheckIn);
        Assert.False(savedCheckIn.IsHidden);
        Assert.False(response.IsHidden);
    }

    private static CheckInService CreateService(ApplicationDbContext context)
    {
        var badgeUnlockService = new Mock<IBadgeUnlockService>();
        badgeUnlockService
            .Setup(service => service.UnlockEligibleBadgesAsync(It.IsAny<Guid>()))
            .ReturnsAsync([]);

        return new CheckInService(
            context,
            badgeUnlockService.Object,
            Mock.Of<ILeaderboardNotificationService>(),
            Mock.Of<INotificationService>(),
            Mock.Of<ILogger<CheckInService>>());
    }

    private static User CreateUser(string email = "user@example.com")
    {
        var now = DateTime.UtcNow;

        return new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            DisplayName = email.Split('@')[0],
            PasswordHash = "password-hash",
            Role = UserRole.User,
            Status = UserStatus.Active,
            AuthProvider = AuthProvider.Local,
            CreatedAt = now,
            UpdatedAt = now
        };
    }

    private static Trail CreateTrail(bool isActive = true)
    {
        var now = DateTime.UtcNow;

        return new Trail
        {
            Id = Guid.NewGuid(),
            DocId = Guid.NewGuid().ToString("N"),
            Name = "Summit Track",
            City = "Christchurch",
            Region = "Canterbury",
            Difficulty = TrailDifficulty.Moderate,
            DistanceKm = 5,
            Description = "Summit Track description",
            CoordinateX = 1572954.6221,
            CoordinateY = 5150889.4148,
            Latitude = -43.781,
            Longitude = 172.664,
            IsActive = isActive,
            CreatedAt = now,
            UpdatedAt = now
        };
    }

    private static CheckIn CreateCheckIn(
        Guid userId,
        Guid trailId,
        DateTime? completedDate = null,
        bool isHidden = false)
    {
        return new CheckIn
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TrailId = trailId,
            CompletedDate = completedDate ?? new DateTime(2026, 1, 5, 10, 0, 0, DateTimeKind.Utc),
            Notes = "Original notes",
            PhotoUrl = "https://example.com/original.jpg",
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
