using backend.Authentication;
using backend.DTOs.CheckIn;
using backend.Services;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("api/checkins")]
[Authorize]
public class CheckInsController : ControllerBase
{
    private readonly ICheckInService _checkInService;
    private readonly ILogger<CheckInsController> _logger;
    private readonly IValidator<CreateCheckInRequest> _createCheckInValidator;
    private readonly IValidator<UpdateCheckInRequest> _updateCheckInValidator;

    public CheckInsController(
        ICheckInService checkInService,
        ILogger<CheckInsController> logger,
        IValidator<CreateCheckInRequest> createCheckInValidator,
        IValidator<UpdateCheckInRequest> updateCheckInValidator)
    {
        _checkInService = checkInService;
        _logger = logger;
        _createCheckInValidator = createCheckInValidator;
        _updateCheckInValidator = updateCheckInValidator;
    }

    [HttpPost]
    public async Task<IActionResult> CreateCheckIn([FromBody] CreateCheckInRequest request)
    {
        var currentUserIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(currentUserIdValue, out var currentUserId))
        {
            return Unauthorized(new { message = "Invalid user token" });
        }

        var validationResult = await _createCheckInValidator.ValidateAsync(request);

        if (!validationResult.IsValid)
        {
            return BadRequest(CreateValidationErrorResponse(validationResult));
        }

        try
        {
            var checkIn = await _checkInService.CreateCheckInAsync(currentUserId, request);
            return CreatedAtAction(nameof(CreateCheckIn), new { id = checkIn.Id }, checkIn);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning("Create check-in failed: {Message}", ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while creating check-in");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    [HttpGet]
    [Authorize(Policy = AuthorizationPolicies.ModeratorOrAdmin)]
    public async Task<IActionResult> GetAllCheckIns()
    {
        try
        {
            var checkIns = await _checkInService.GetAllCheckInsAsync();
            return Ok(checkIns);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while retrieving all check-ins");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyCheckInHistory()
    {
        var currentUserIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(currentUserIdValue, out var currentUserId))
        {
            return Unauthorized(new { message = "Invalid user token" });
        }

        try
        {
            var checkIns = await _checkInService.GetUserCheckInHistoryAsync(currentUserId);
            return Ok(checkIns);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while retrieving check-in history");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateCheckIn(
        [FromRoute] Guid id,
        [FromBody] UpdateCheckInRequest request)
    {
        var currentUserIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(currentUserIdValue, out var currentUserId))
        {
            return Unauthorized(new { message = "Invalid user token" });
        }

        var validationResult = await _updateCheckInValidator.ValidateAsync(request);

        if (!validationResult.IsValid)
        {
            return BadRequest(CreateValidationErrorResponse(validationResult));
        }

        try
        {
            var checkIn = await _checkInService.UpdateCheckInAsync(id, currentUserId, request);
            return Ok(checkIn);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning("Update check-in failed: {Message}", ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Update check-in forbidden: {Message}", ex.Message);
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while updating check-in {CheckInId}", id);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCheckIn([FromRoute] Guid id)
    {
        var currentUserIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(currentUserIdValue, out var currentUserId))
        {
            return Unauthorized(new { message = "Invalid user token" });
        }

        try
        {
            await _checkInService.DeleteCheckInAsync(id, currentUserId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning("Delete check-in failed: {Message}", ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Delete check-in forbidden: {Message}", ex.Message);
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while deleting check-in {CheckInId}", id);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    [HttpPut("{id:guid}/hide")]
    [Authorize(Policy = AuthorizationPolicies.ModeratorOrAdmin)]
    public async Task<IActionResult> HideCheckIn([FromRoute] Guid id)
    {
        try
        {
            var checkIn = await _checkInService.HideCheckInAsync(id);
            return Ok(checkIn);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning("Hide check-in failed: {Message}", ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while hiding check-in {CheckInId}", id);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    [HttpPut("{id:guid}/restore")]
    [Authorize(Policy = AuthorizationPolicies.ModeratorOrAdmin)]
    public async Task<IActionResult> RestoreCheckIn([FromRoute] Guid id)
    {
        try
        {
            var checkIn = await _checkInService.RestoreCheckInAsync(id);
            return Ok(checkIn);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning("Restore check-in failed: {Message}", ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while restoring check-in {CheckInId}", id);
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    private static object CreateValidationErrorResponse(FluentValidation.Results.ValidationResult validationResult)
    {
        return new
        {
            message = "Validation failed",
            errors = validationResult.Errors.Select(error => new
            {
                field = error.PropertyName,
                message = error.ErrorMessage
            })
        };
    }
}
