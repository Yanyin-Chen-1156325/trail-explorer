using backend.Authentication;
using backend.DTOs.User;
using backend.Enums;
using backend.Services;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = AuthorizationPolicies.ModeratorOrAdmin)]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<UsersController> _logger;
    private readonly IValidator<UpdateUserRoleRequest> _updateUserRoleValidator;
    private readonly IValidator<UpdateUserStatusRequest> _updateUserStatusValidator;

    public UsersController(
        IUserService userService,
        ILogger<UsersController> logger,
        IValidator<UpdateUserRoleRequest> updateUserRoleValidator,
        IValidator<UpdateUserStatusRequest> updateUserStatusValidator)
    {
        _userService = userService;
        _logger = logger;
        _updateUserRoleValidator = updateUserRoleValidator;
        _updateUserStatusValidator = updateUserStatusValidator;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        try
        {
            var users = await _userService.GetUsersAsync();
            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while retrieving users");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    [HttpPut("{id:guid}/role")]
    [Authorize(Policy = AuthorizationPolicies.AdminOnly)]
    public async Task<IActionResult> UpdateUserRole([FromRoute] Guid id, [FromBody] UpdateUserRoleRequest request)
    {
        var currentUserIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (Guid.TryParse(currentUserIdValue, out var currentUserId) && currentUserId == id)
        {
            return BadRequest(new { message = "You cannot change your own role" });
        }

        var validationResult = await _updateUserRoleValidator.ValidateAsync(request);

        if (!validationResult.IsValid)
        {
            return BadRequest(new
            {
                message = "Validation failed",
                errors = validationResult.Errors.Select(error => new
                {
                    field = error.PropertyName,
                    message = error.ErrorMessage
                })
            });
        }

        try
        {
            var user = await _userService.UpdateUserRoleAsync(id, request);
            return Ok(user);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning("Update user role failed: {Message}", ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while updating user role");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    [HttpPut("{id:guid}/status")]
    [Authorize(Policy = AuthorizationPolicies.ModeratorOrAdmin)]
    public async Task<IActionResult> UpdateUserStatus([FromRoute] Guid id, [FromBody] UpdateUserStatusRequest request)
    {
        var currentUserIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var currentUserRoleValue = User.FindFirstValue(ClaimTypes.Role);

        if (!Enum.TryParse<UserRole>(currentUserRoleValue, out var currentUserRole))
        {
            return Forbid();
        }

        if (Guid.TryParse(currentUserIdValue, out var currentUserId) && currentUserId == id)
        {
            return BadRequest(new { message = "You cannot change your own status" });
        }

        var validationResult = await _updateUserStatusValidator.ValidateAsync(request);

        if (!validationResult.IsValid)
        {
            return BadRequest(new
            {
                message = "Validation failed",
                errors = validationResult.Errors.Select(error => new
                {
                    field = error.PropertyName,
                    message = error.ErrorMessage
                })
            });
        }

        if (currentUserRole == UserRole.Moderator && request.Status != UserStatus.Suspended)
        {
            return Forbid();
        }

        try
        {
            var user = await _userService.UpdateUserStatusAsync(id, request, currentUserRole);
            return Ok(user);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning("Update user status failed: {Message}", ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Update user status forbidden: {Message}", ex.Message);
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while updating user status");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }
}
