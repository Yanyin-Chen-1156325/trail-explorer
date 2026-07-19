using backend.Authentication;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Authorize(Policy = AuthorizationPolicies.AdminOnly)]
[Route("api/admin/trails")]
public class AdminTrailsController : ControllerBase
{
    private readonly ITrailSyncService _trailSyncService;
    private readonly ILogger<AdminTrailsController> _logger;

    public AdminTrailsController(
        ITrailSyncService trailSyncService,
        ILogger<AdminTrailsController> logger)
    {
        _trailSyncService = trailSyncService;
        _logger = logger;
    }

    [HttpPost("sync")]
    public async Task<IActionResult> SyncDocTrails(CancellationToken cancellationToken)
    {
        try
        {
            var result = await _trailSyncService.SyncFromDocAsync(cancellationToken);

            if (!result.Succeeded)
            {
                return StatusCode(502, result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while triggering DOC trail synchronisation");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }
}
