using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/leaderboard")]
[Authorize]
public class LeaderboardController : ControllerBase
{
    private readonly ILeaderboardService _leaderboardService;
    private readonly ILogger<LeaderboardController> _logger;

    public LeaderboardController(
        ILeaderboardService leaderboardService,
        ILogger<LeaderboardController> logger)
    {
        _leaderboardService = leaderboardService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetLeaderboard([FromQuery] int limit = 50)
    {
        try
        {
            var leaderboard = await _leaderboardService.GetLeaderboardAsync(limit);
            return Ok(leaderboard);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while retrieving leaderboard");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }
}
