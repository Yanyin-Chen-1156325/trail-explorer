using backend.DTOs.Trail;
using backend.Services;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TrailsController : ControllerBase
{
    private readonly ITrailService _trailService;
    private readonly ILogger<TrailsController> _logger;
    private readonly IValidator<TrailQueryRequest> _trailQueryValidator;

    public TrailsController(
        ITrailService trailService,
        ILogger<TrailsController> logger,
        IValidator<TrailQueryRequest> trailQueryValidator)
    {
        _trailService = trailService;
        _logger = logger;
        _trailQueryValidator = trailQueryValidator;
    }

    [HttpGet]
    public async Task<IActionResult> GetTrails([FromQuery] TrailQueryRequest query)
    {
        var validationResult = await _trailQueryValidator.ValidateAsync(query);

        if (!validationResult.IsValid)
        {
            return BadRequest(CreateValidationErrorResponse(validationResult));
        }

        try
        {
            var trails = await _trailService.GetTrailsAsync(query);
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
