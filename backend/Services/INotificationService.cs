using backend.DTOs.Notification;
using backend.Entities;

namespace backend.Services;

public interface INotificationService
{
    Task<IReadOnlyList<NotificationResponse>> GetUserNotificationsAsync(Guid userId);

    Task<int> GetUnreadNotificationCountAsync(Guid userId);

    Task<NotificationResponse> MarkNotificationAsReadAsync(Guid userId, Guid notificationId);

    Task<int> MarkAllNotificationsAsReadAsync(Guid userId);

    Task CreateAchievementNotificationsAsync(
        Guid userId,
        Guid checkInId,
        IReadOnlyCollection<Badge> unlockedBadges,
        DateTime createdAtUtc);
}
