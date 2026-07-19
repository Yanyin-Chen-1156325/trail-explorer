using backend.DTOs.Notification;

namespace backend.Services;

public interface INotificationBroadcastService
{
    Task BroadcastNotificationCreatedAsync(Guid userId, NotificationResponse notification);

    Task BroadcastUnreadCountChangedAsync(Guid userId, int unreadCount);
}
