using System.Security.Claims;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Authorize]
[Route("api/notifications")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;
    private readonly ILogger<NotificationsController> _logger;

    public NotificationsController(
        INotificationService notificationService,
        ILogger<NotificationsController> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyNotifications()
    {
        var userId = GetCurrentUserId();

        if (userId is null)
        {
            return Unauthorized(new { message = "Invalid user token" });
        }

        try
        {
            var notifications =
                await _notificationService.GetUserNotificationsAsync(userId.Value);

            return Ok(notifications);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while retrieving notifications");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadNotificationCount()
    {
        var userId = GetCurrentUserId();

        if (userId is null)
        {
            return Unauthorized(new { message = "Invalid user token" });
        }

        try
        {
            var count =
                await _notificationService.GetUnreadNotificationCountAsync(userId.Value);

            return Ok(new backend.DTOs.Notification.UnreadNotificationCountResponse(count));
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Unexpected error while retrieving unread notification count");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    [HttpPut("{notificationId:guid}/read")]
    public async Task<IActionResult> MarkNotificationAsRead(Guid notificationId)
    {
        var userId = GetCurrentUserId();

        if (userId is null)
        {
            return Unauthorized(new { message = "Invalid user token" });
        }

        try
        {
            var notification = await _notificationService.MarkNotificationAsReadAsync(
                userId.Value,
                notificationId);

            return Ok(notification);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Notification not found" });
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Unexpected error while marking notification as read");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllNotificationsAsRead()
    {
        var userId = GetCurrentUserId();

        if (userId is null)
        {
            return Unauthorized(new { message = "Invalid user token" });
        }

        try
        {
            await _notificationService.MarkAllNotificationsAsReadAsync(userId.Value);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Unexpected error while marking all notifications as read");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    private Guid? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        return Guid.TryParse(userIdClaim, out var userId)
            ? userId
            : null;
    }
}
