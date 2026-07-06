using backend.DTOs.User;
using backend.Enums;

namespace backend.Services;

public interface IUserService
{
    Task<IReadOnlyList<UserResponse>> GetUsersAsync();

    Task<UserResponse> UpdateUserRoleAsync(Guid userId, UpdateUserRoleRequest request);

    Task<UserResponse> UpdateUserStatusAsync(Guid userId, UpdateUserStatusRequest request, UserRole? actorRole = null);
}
