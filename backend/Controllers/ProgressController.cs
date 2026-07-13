using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("api/progress")]
[Authorize]
public class ProgressController : ControllerBase
{
    private readonly IUserProgressService _userProgressService;
    private readonly ILogger<ProgressController> _logger;

    public ProgressController(
        IUserProgressService userProgressService,
        ILogger<ProgressController> logger)
    {
        _userProgressService = userProgressService;
        _logger = logger;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyProgress()
    {
        var currentUserIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(currentUserIdValue, out var currentUserId))
        {
            return Unauthorized(new { message = "Invalid user token" });
        }

        try
        {
            var progress = await _userProgressService.GetUserProgressAsync(currentUserId);
            return Ok(progress);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while retrieving user progress");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }
}
