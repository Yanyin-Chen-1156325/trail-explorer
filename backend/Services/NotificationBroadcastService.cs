using backend.DTOs.Notification;
using backend.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace backend.Services;

public class NotificationBroadcastService : INotificationBroadcastService
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public NotificationBroadcastService(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task BroadcastNotificationCreatedAsync(
        Guid userId,
        NotificationResponse notification)
    {
        await _hubContext.Clients
            .User(userId.ToString())
            .SendAsync("NotificationReceived", notification);
    }

    public async Task BroadcastUnreadCountChangedAsync(Guid userId, int unreadCount)
    {
        await _hubContext.Clients
            .User(userId.ToString())
            .SendAsync(
                "UnreadNotificationCountUpdated",
                new UnreadNotificationCountResponse(unreadCount));
    }
}
