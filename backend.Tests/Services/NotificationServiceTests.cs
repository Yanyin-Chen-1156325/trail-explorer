using backend.Data;
using backend.Entities;
using backend.Enums;
using backend.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace backend.Tests.Services;

public class NotificationServiceTests
{
    [Fact]
    public async Task GetUserNotificationsAsync_ReturnsUserNotificationsNewestFirst()
    {
        using var database = CreateDatabase();
        var user = CreateUser();
        var otherUser = CreateUser("other@example.com");
        var older = CreateNotification(user.Id, createdAt: new DateTime(2026, 7, 1, 8, 0, 0, DateTimeKind.Utc));
        var newer = CreateNotification(user.Id, createdAt: new DateTime(2026, 7, 2, 8, 0, 0, DateTimeKind.Utc));
        var other = CreateNotification(otherUser.Id, createdAt: new DateTime(2026, 7, 3, 8, 0, 0, DateTimeKind.Utc));
        database.Context.Users.AddRange(user, otherUser);
        database.Context.Notifications.AddRange(older, newer, other);
        await database.Context.SaveChangesAsync();
        var service = CreateService(database.Context);

        var notifications = await service.GetUserNotificationsAsync(user.Id);

        Assert.Equal([newer.Id, older.Id], notifications.Select(x => x.Id));
    }

    [Fact]
    public async Task GetUnreadNotificationCountAsync_ReturnsOnlyUnreadUserNotifications()
    {
        using var database = CreateDatabase();
        var user = CreateUser();
        var otherUser = CreateUser("other@example.com");
        database.Context.Users.AddRange(user, otherUser);
        database.Context.Notifications.AddRange(
            CreateNotification(user.Id),
            CreateNotification(user.Id, isRead: true),
            CreateNotification(otherUser.Id));
        await database.Context.SaveChangesAsync();
        var service = CreateService(database.Context);

        var count = await service.GetUnreadNotificationCountAsync(user.Id);

        Assert.Equal(1, count);
    }

    [Fact]
    public async Task MarkNotificationAsReadAsync_UpdatesOnlyOwnedNotification()
    {
        using var database = CreateDatabase();
        var user = CreateUser();
        var notification = CreateNotification(user.Id);
        database.Context.Users.Add(user);
        database.Context.Notifications.Add(notification);
        await database.Context.SaveChangesAsync();
        var broadcast = new Mock<INotificationBroadcastService>();
        var service = CreateService(database.Context, broadcast);

        var response = await service.MarkNotificationAsReadAsync(user.Id, notification.Id);

        Assert.True(response.IsRead);
        Assert.True((await database.Context.Notifications.FindAsync(notification.Id))!.IsRead);
        broadcast.Verify(
            service => service.BroadcastUnreadCountChangedAsync(user.Id, 0),
            Times.Once);
    }

    [Fact]
    public async Task MarkNotificationAsReadAsync_WhenNotificationDoesNotBelongToUser_Throws()
    {
        using var database = CreateDatabase();
        var user = CreateUser();
        var otherUser = CreateUser("other@example.com");
        var notification = CreateNotification(otherUser.Id);
        database.Context.Users.AddRange(user, otherUser);
        database.Context.Notifications.Add(notification);
        await database.Context.SaveChangesAsync();
        var service = CreateService(database.Context);

        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            service.MarkNotificationAsReadAsync(user.Id, notification.Id));
    }

    [Fact]
    public async Task MarkAllNotificationsAsReadAsync_UpdatesUnreadOwnedNotifications()
    {
        using var database = CreateDatabase();
        var user = CreateUser();
        var otherUser = CreateUser("other@example.com");
        database.Context.Users.AddRange(user, otherUser);
        database.Context.Notifications.AddRange(
            CreateNotification(user.Id),
            CreateNotification(user.Id),
            CreateNotification(otherUser.Id));
        await database.Context.SaveChangesAsync();
        var broadcast = new Mock<INotificationBroadcastService>();
        var service = CreateService(database.Context, broadcast);

        var updatedCount = await service.MarkAllNotificationsAsReadAsync(user.Id);

        Assert.Equal(2, updatedCount);
        Assert.Equal(0, await service.GetUnreadNotificationCountAsync(user.Id));
        Assert.Equal(1, await service.GetUnreadNotificationCountAsync(otherUser.Id));
        broadcast.Verify(
            service => service.BroadcastUnreadCountChangedAsync(user.Id, 0),
            Times.Once);
    }

    [Fact]
    public async Task CreateAchievementNotificationsAsync_CreatesXpLevelStreakAndBadgeNotifications()
    {
        using var database = CreateDatabase();
        var user = CreateUser();
        var olderTrail = CreateTrail(distanceKm: 1, difficulty: TrailDifficulty.Easy);
        var currentTrail = CreateTrail(distanceKm: 50, difficulty: TrailDifficulty.Intermediate);
        var previousCheckIn = CreateCheckIn(
            user.Id,
            olderTrail.Id,
            new DateTime(2026, 7, 6, 10, 0, 0, DateTimeKind.Utc));
        var currentCheckIn = CreateCheckIn(
            user.Id,
            currentTrail.Id,
            new DateTime(2026, 7, 13, 10, 0, 0, DateTimeKind.Utc));
        var badge = CreateBadge();
        database.Context.Users.Add(user);
        database.Context.Trails.AddRange(olderTrail, currentTrail);
        database.Context.CheckIns.AddRange(previousCheckIn, currentCheckIn);
        await database.Context.SaveChangesAsync();
        var broadcast = new Mock<INotificationBroadcastService>();
        var service = CreateService(database.Context, broadcast);

        var createdNotifications = await service.CreateAchievementNotificationsAsync(
            user.Id,
            currentCheckIn.Id,
            [badge],
            new DateTime(2026, 7, 13, 12, 0, 0, DateTimeKind.Utc));

        var notifications = await database.Context.Notifications
            .OrderBy(notification => notification.Type)
            .ToListAsync();
        Assert.Equal(4, notifications.Count);
        Assert.Contains(notifications, x => x.Type == NotificationType.BadgeUnlocked);
        Assert.Contains(notifications, x => x.Type == NotificationType.XpGained);
        Assert.Contains(notifications, x => x.Type == NotificationType.LevelUp);
        Assert.Contains(notifications, x => x.Type == NotificationType.WeeklyStreak);
        broadcast.Verify(
            service => service.BroadcastNotificationCreatedAsync(
                It.IsAny<Guid>(),
                It.IsAny<backend.DTOs.Notification.NotificationResponse>()),
            Times.Never);

        await service.BroadcastCreatedNotificationsAsync(user.Id, createdNotifications);

        broadcast.Verify(
            service => service.BroadcastNotificationCreatedAsync(
                user.Id,
                It.IsAny<backend.DTOs.Notification.NotificationResponse>()),
            Times.Exactly(4));
        broadcast.Verify(
            service => service.BroadcastUnreadCountChangedAsync(user.Id, 4),
            Times.Once);
    }

    [Fact]
    public async Task CreateXpDeductedNotificationAsync_PersistsAndBroadcastsNotification()
    {
        using var database = CreateDatabase();
        var user = CreateUser();
        database.Context.Users.Add(user);
        await database.Context.SaveChangesAsync();
        var broadcast = new Mock<INotificationBroadcastService>();
        var service = CreateService(database.Context, broadcast);
        var createdAt = new DateTime(2026, 7, 14, 12, 0, 0, DateTimeKind.Utc);

        var createdNotification = await service.CreateXpDeductedNotificationAsync(
            user.Id,
            60,
            "a check-in was hidden",
            createdAt);

        var notification = await database.Context.Notifications.SingleAsync();
        Assert.Equal(NotificationType.XpDeducted, notification.Type);
        Assert.Equal("XP deducted", notification.Title);
        Assert.Equal(
            "60 XP was deducted because a check-in was hidden.",
            notification.Message);
        Assert.Equal(createdAt, notification.CreatedAt);
        broadcast.Verify(
            service => service.BroadcastNotificationCreatedAsync(
                It.IsAny<Guid>(),
                It.IsAny<backend.DTOs.Notification.NotificationResponse>()),
            Times.Never);

        await service.BroadcastCreatedNotificationsAsync(
            user.Id,
            [Assert.IsType<backend.DTOs.Notification.NotificationResponse>(createdNotification)]);

        broadcast.Verify(
            service => service.BroadcastNotificationCreatedAsync(
                user.Id,
                It.Is<backend.DTOs.Notification.NotificationResponse>(response =>
                    response.Type == NotificationType.XpDeducted)),
            Times.Once);
        broadcast.Verify(
            service => service.BroadcastUnreadCountChangedAsync(user.Id, 1),
            Times.Once);
    }

    [Fact]
    public async Task CreateXpRegainedNotificationAsync_PersistsAndBroadcastsNotification()
    {
        using var database = CreateDatabase();
        var user = CreateUser();
        database.Context.Users.Add(user);
        await database.Context.SaveChangesAsync();
        var broadcast = new Mock<INotificationBroadcastService>();
        var service = CreateService(database.Context, broadcast);

        var createdNotification = await service.CreateXpRegainedNotificationAsync(
            user.Id,
            60,
            new DateTime(2026, 7, 14, 12, 0, 0, DateTimeKind.Utc));

        var notification = await database.Context.Notifications.SingleAsync();
        Assert.Equal(NotificationType.XpRegained, notification.Type);
        Assert.Equal("XP regained", notification.Title);
        Assert.Equal(
            "You regained 60 XP because a check-in was restored.",
            notification.Message);
        broadcast.Verify(
            service => service.BroadcastNotificationCreatedAsync(
                It.IsAny<Guid>(),
                It.IsAny<backend.DTOs.Notification.NotificationResponse>()),
            Times.Never);

        await service.BroadcastCreatedNotificationsAsync(
            user.Id,
            [Assert.IsType<backend.DTOs.Notification.NotificationResponse>(createdNotification)]);

        broadcast.Verify(
            service => service.BroadcastNotificationCreatedAsync(
                user.Id,
                It.Is<backend.DTOs.Notification.NotificationResponse>(response =>
                    response.Type == NotificationType.XpRegained)),
            Times.Once);
    }

    private static NotificationService CreateService(
        ApplicationDbContext context,
        Mock<INotificationBroadcastService>? broadcast = null)
    {
        return new NotificationService(
            context,
            new XpCalculatorService(),
            new LevelCalculatorService(),
            new StreakCalculatorService(),
            (broadcast ?? new Mock<INotificationBroadcastService>()).Object);
    }

    private static Notification CreateNotification(
        Guid userId,
        bool isRead = false,
        DateTime? createdAt = null)
    {
        return new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = NotificationType.XpGained,
            Title = "XP gained",
            Message = "You gained XP.",
            IsRead = isRead,
            CreatedAt = createdAt ?? DateTime.UtcNow
        };
    }

    private static Badge CreateBadge()
    {
        return new Badge
        {
            Id = Guid.NewGuid(),
            Name = "First Trail",
            Description = "Complete your first trail.",
            IconUrl = "/badges/first-trail.svg",
            Type = BadgeType.Completion
        };
    }

    private static CheckIn CreateCheckIn(Guid userId, Guid trailId, DateTime completedDate)
    {
        return new CheckIn
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TrailId = trailId,
            CompletedDate = completedDate
        };
    }

    private static Trail CreateTrail(
        decimal distanceKm,
        TrailDifficulty difficulty)
    {
        var now = DateTime.UtcNow;

        return new Trail
        {
            Id = Guid.NewGuid(),
            DocId = Guid.NewGuid().ToString("N"),
            Name = "Summit Track",
            City = "Christchurch",
            Region = "Canterbury",
            Difficulty = difficulty,
            DistanceKm = distanceKm,
            Description = "Summit Track description",
            CoordinateX = 1572954.6221,
            CoordinateY = 5150889.4148,
            Latitude = -43.781,
            Longitude = 172.664,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };
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
