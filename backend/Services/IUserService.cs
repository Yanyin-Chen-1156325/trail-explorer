using backend.DTOs.User;

namespace backend.Services;

public interface IUserService
{
    Task<IReadOnlyList<UserResponse>> GetUsersAsync();

    Task<UserResponse> UpdateUserRoleAsync(Guid userId, UpdateUserRoleRequest request);
}