using backend.Data;
using backend.DTOs.Notification;
using backend.Entities;
using backend.Enums;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class NotificationService : INotificationService
{
    private readonly ApplicationDbContext _context;
    private readonly IXpCalculatorService _xpCalculatorService;
    private readonly ILevelCalculatorService _levelCalculatorService;
    private readonly IStreakCalculatorService _streakCalculatorService;
    private readonly INotificationBroadcastService _notificationBroadcastService;

    private static readonly IReadOnlySet<int> WeeklyStreakMilestones =
        new HashSet<int> { 2, 4, 8, 12, 24 };

    public NotificationService(
        ApplicationDbContext context,
        IXpCalculatorService xpCalculatorService,
        ILevelCalculatorService levelCalculatorService,
        IStreakCalculatorService streakCalculatorService,
        INotificationBroadcastService notificationBroadcastService)
    {
        _context = context;
        _xpCalculatorService = xpCalculatorService;
        _levelCalculatorService = levelCalculatorService;
        _streakCalculatorService = streakCalculatorService;
        _notificationBroadcastService = notificationBroadcastService;
    }

    public async Task<IReadOnlyList<NotificationResponse>> GetUserNotificationsAsync(Guid userId)
    {
        return await _context.Notifications
            .AsNoTracking()
            .Where(notification => notification.UserId == userId)
            .OrderByDescending(notification => notification.CreatedAt)
            .Select(notification => new NotificationResponse
            {
                Id = notification.Id,
                Type = notification.Type,
                Title = notification.Title,
                Message = notification.Message,
                IsRead = notification.IsRead,
                CreatedAt = notification.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<int> GetUnreadNotificationCountAsync(Guid userId)
    {
        return await _context.Notifications
            .AsNoTracking()
            .CountAsync(notification =>
                notification.UserId == userId &&
                !notification.IsRead);
    }

    public async Task<NotificationResponse> MarkNotificationAsReadAsync(
        Guid userId,
        Guid notificationId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(x => x.Id == notificationId && x.UserId == userId);

        if (notification is null)
        {
            throw new KeyNotFoundException("Notification not found");
        }

        notification.IsRead = true;
        await _context.SaveChangesAsync();

        await BroadcastUnreadCountAsync(userId);

        return ToResponse(notification);
    }

    public async Task<int> MarkAllNotificationsAsReadAsync(Guid userId)
    {
        var unreadNotifications = await _context.Notifications
            .Where(notification =>
                notification.UserId == userId &&
                !notification.IsRead)
            .ToListAsync();

        if (unreadNotifications.Count == 0)
        {
            return 0;
        }

        foreach (var notification in unreadNotifications)
        {
            notification.IsRead = true;
        }

        await _context.SaveChangesAsync();
        await _notificationBroadcastService.BroadcastUnreadCountChangedAsync(userId, 0);

        return unreadNotifications.Count;
    }

    public async Task<IReadOnlyList<NotificationResponse>> CreateAchievementNotificationsAsync(
        Guid userId,
        Guid checkInId,
        IReadOnlyCollection<Badge> unlockedBadges,
        DateTime createdAtUtc)
    {
        var checkIns = await _context.CheckIns
            .AsNoTracking()
            .Where(checkIn => checkIn.UserId == userId && !checkIn.IsHidden)
            .Select(checkIn => new NotificationProgressCheckIn(
                checkIn.Id,
                checkIn.CompletedDate,
                checkIn.Trail.DistanceKm,
                checkIn.Trail.Difficulty))
            .ToListAsync();

        var currentProgress = CalculateProgress(checkIns, createdAtUtc);
        var previousProgress = CalculateProgress(
            checkIns.Where(checkIn => checkIn.Id != checkInId).ToList(),
            createdAtUtc);

        var notifications = new List<Notification>();

        notifications.AddRange(unlockedBadges.Select(badge => new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = NotificationType.BadgeUnlocked,
            Title = "Badge unlocked",
            Message = $"You unlocked {badge.Name}.",
            IsRead = false,
            CreatedAt = createdAtUtc
        }));

        var gainedXp = currentProgress.TotalXp - previousProgress.TotalXp;
        if (gainedXp > 0)
        {
            notifications.Add(new Notification
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Type = NotificationType.XpGained,
                Title = "XP gained",
                Message = $"You gained {gainedXp} XP from your latest trail.",
                IsRead = false,
                CreatedAt = createdAtUtc
            });
        }

        if (currentProgress.Level > previousProgress.Level)
        {
            notifications.Add(new Notification
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Type = NotificationType.LevelUp,
                Title = "Level up",
                Message = $"You reached level {currentProgress.Level}.",
                IsRead = false,
                CreatedAt = createdAtUtc
            });
        }

        if (currentProgress.WeeklyStreak > previousProgress.WeeklyStreak &&
            WeeklyStreakMilestones.Contains(currentProgress.WeeklyStreak))
        {
            notifications.Add(new Notification
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Type = NotificationType.WeeklyStreak,
                Title = "Weekly streak milestone",
                Message = $"You reached a {currentProgress.WeeklyStreak}-week streak.",
                IsRead = false,
                CreatedAt = createdAtUtc
            });
        }

        if (notifications.Count == 0)
        {
            return [];
        }

        _context.Notifications.AddRange(notifications);
        await _context.SaveChangesAsync();

        return notifications.Select(ToResponse).ToList();
    }

    public Task<NotificationResponse?> CreateXpDeductedNotificationAsync(
        Guid userId,
        int deductedXp,
        string reason,
        DateTime createdAtUtc)
    {
        return CreateNotificationAsync(new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = NotificationType.XpDeducted,
            Title = "XP deducted",
            Message = $"{deductedXp} XP was deducted because {reason}.",
            IsRead = false,
            CreatedAt = createdAtUtc
        });
    }

    public Task<NotificationResponse?> CreateXpRegainedNotificationAsync(
        Guid userId,
        int regainedXp,
        DateTime createdAtUtc)
    {
        return CreateNotificationAsync(new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = NotificationType.XpRegained,
            Title = "XP regained",
            Message = $"You regained {regainedXp} XP because a check-in was restored.",
            IsRead = false,
            CreatedAt = createdAtUtc
        });
    }

    public async Task BroadcastCreatedNotificationsAsync(
        Guid userId,
        IReadOnlyCollection<NotificationResponse> notifications)
    {
        if (notifications.Count == 0)
        {
            return;
        }

        foreach (var notification in notifications)
        {
            await _notificationBroadcastService.BroadcastNotificationCreatedAsync(
                userId,
                notification);
        }

        await BroadcastUnreadCountAsync(userId);
    }

    private NotificationProgress CalculateProgress(
        IReadOnlyCollection<NotificationProgressCheckIn> checkIns,
        DateTime currentDateUtc)
    {
        var totalXp = _xpCalculatorService.CalculateTotalXp(checkIns.Select(checkIn =>
            new TrailXpInput(checkIn.DistanceKm, checkIn.Difficulty)));
        var level = _levelCalculatorService.CalculateLevel(totalXp);
        var weeklyStreak = _streakCalculatorService.CalculateWeeklyStreak(
            checkIns.Select(checkIn => checkIn.CompletedDate),
            currentDateUtc);

        return new NotificationProgress(totalXp, level, weeklyStreak);
    }

    private async Task BroadcastUnreadCountAsync(Guid userId)
    {
        var unreadCount = await GetUnreadNotificationCountAsync(userId);
        await _notificationBroadcastService.BroadcastUnreadCountChangedAsync(
            userId,
            unreadCount);
    }

    private async Task<NotificationResponse?> CreateNotificationAsync(Notification notification)
    {
        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();
        return ToResponse(notification);
    }

    private static NotificationResponse ToResponse(Notification notification)
    {
        return new NotificationResponse
        {
            Id = notification.Id,
            Type = notification.Type,
            Title = notification.Title,
            Message = notification.Message,
            IsRead = notification.IsRead,
            CreatedAt = notification.CreatedAt
        };
    }

    private sealed record NotificationProgressCheckIn(
        Guid Id,
        DateTime CompletedDate,
        decimal DistanceKm,
        TrailDifficulty Difficulty);

    private sealed record NotificationProgress(
        int TotalXp,
        int Level,
        int WeeklyStreak);
}
