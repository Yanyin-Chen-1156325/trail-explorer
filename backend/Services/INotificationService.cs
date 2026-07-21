using backend.DTOs.Notification;
using backend.Entities;

namespace backend.Services;

public interface INotificationService
{
    Task<IReadOnlyList<NotificationResponse>> GetUserNotificationsAsync(Guid userId);

    Task<int> GetUnreadNotificationCountAsync(Guid userId);

    Task<NotificationResponse> MarkNotificationAsReadAsync(Guid userId, Guid notificationId);

    Task<int> MarkAllNotificationsAsReadAsync(Guid userId);

    Task<IReadOnlyList<NotificationResponse>> CreateAchievementNotificationsAsync(
        Guid userId,
        Guid checkInId,
        IReadOnlyCollection<Badge> unlockedBadges,
        DateTime createdAtUtc);

    Task<NotificationResponse?> CreateXpDeductedNotificationAsync(
        Guid userId,
        int deductedXp,
        string reason,
        DateTime createdAtUtc);

    Task<NotificationResponse?> CreateXpRegainedNotificationAsync(
        Guid userId,
        int regainedXp,
        DateTime createdAtUtc);

    Task BroadcastCreatedNotificationsAsync(
        Guid userId,
        IReadOnlyCollection<NotificationResponse> notifications);
}
