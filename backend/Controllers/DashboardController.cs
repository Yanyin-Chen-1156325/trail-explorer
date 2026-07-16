using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private readonly ILogger<DashboardController> _logger;

    public DashboardController(
        IDashboardService dashboardService,
        ILogger<DashboardController> logger)
    {
        _dashboardService = dashboardService;
        _logger = logger;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyDashboard()
    {
        var currentUserIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(currentUserIdValue, out var currentUserId))
        {
            return Unauthorized(new { message = "Invalid user token" });
        }

        try
        {
            var dashboard = await _dashboardService.GetDashboardAsync(currentUserId);
            return Ok(dashboard);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while retrieving dashboard");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }
}
