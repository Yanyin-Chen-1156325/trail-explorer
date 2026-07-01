using backend.Data;
using backend.DTOs.User;
using backend.Entities;
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
}