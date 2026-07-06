using backend.Data;
using backend.DTOs.User;
using backend.Entities;
using backend.Enums;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class UserService : IUserService
{
    private readonly ApplicationDbContext _context;

    public UserService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<UserResponse>> GetUsersAsync()
    {
        return await _context.Users
            .AsNoTracking()
            .OrderByDescending(user => user.CreatedAt)
            .Select(user => new UserResponse
            {
                Id = user.Id,
                Email = user.Email,
                DisplayName = user.DisplayName,
                Role = user.Role,
                Status = user.Status,
                AuthProvider = user.AuthProvider,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<UserResponse> UpdateUserRoleAsync(Guid userId, UpdateUserRoleRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(candidate => candidate.Id == userId);

        if (user is null)
        {
            throw new KeyNotFoundException("User not found");
        }

        if (user.Role == request.Role)
        {
            return new UserResponse
            {
                Id = user.Id,
                Email = user.Email,
                DisplayName = user.DisplayName,
                Role = user.Role,
                Status = user.Status,
                AuthProvider = user.AuthProvider,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            };
        }

        user.Role = request.Role;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new UserResponse
        {
            Id = user.Id,
            Email = user.Email,
            DisplayName = user.DisplayName,
            Role = user.Role,
            Status = user.Status,
            AuthProvider = user.AuthProvider,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }

    public async Task<UserResponse> UpdateUserStatusAsync(Guid userId, UpdateUserStatusRequest request, UserRole? actorRole = null)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(candidate => candidate.Id == userId);

        if (user is null)
        {
            throw new KeyNotFoundException("User not found");
        }

        if (actorRole == UserRole.Moderator && user.Role != UserRole.User)
        {
            throw new UnauthorizedAccessException("Moderators can only suspend user accounts");
        }

        if (user.Status == request.Status)
        {
            return ToUserResponse(user);
        }

        user.Status = request.Status;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return ToUserResponse(user);
    }

    private static UserResponse ToUserResponse(User user)
    {
        return new UserResponse
        {
            Id = user.Id,
            Email = user.Email,
            DisplayName = user.DisplayName,
            Role = user.Role,
            Status = user.Status,
            AuthProvider = user.AuthProvider,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }
}
