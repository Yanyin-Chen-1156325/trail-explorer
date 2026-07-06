using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TrailsController : ControllerBase
{
    private readonly ITrailService _trailService;
    private readonly ILogger<TrailsController> _logger;

    public TrailsController(
        ITrailService trailService,
        ILogger<TrailsController> logger)
    {
        _trailService = trailService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetTrails()
    {
        try
        {
            var trails = await _trailService.GetTrailsAsync();
            return Ok(trails);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while retrieving trails");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetTrailById([FromRoute] Guid id)
    {
        try
        {
            var trail = await _trailService.GetTrailByIdAsync(id);

            if (trail is null)
            {
                return NotFound(new { message = "Trail not found" });
            }

            return Ok(trail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while retrieving trail {TrailId}", id);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }
}
