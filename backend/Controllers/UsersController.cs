using backend.Authentication;
using backend.DTOs.User;
using backend.Services;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = AuthorizationPolicies.AdminOnly)]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<UsersController> _logger;
    private readonly IValidator<UpdateUserRoleRequest> _updateUserRoleValidator;

    public UsersController(
        IUserService userService,
        ILogger<UsersController> logger,
        IValidator<UpdateUserRoleRequest> updateUserRoleValidator)
    {
        _userService = userService;
        _logger = logger;
        _updateUserRoleValidator = updateUserRoleValidator;
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
    public async Task<IActionResult> UpdateUserRole([FromRoute] Guid id, [FromBody] UpdateUserRoleRequest request)
    {
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
}
