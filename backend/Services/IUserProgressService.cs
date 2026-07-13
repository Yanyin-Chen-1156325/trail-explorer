using backend.DTOs.Gamification;

namespace backend.Services;

public interface IUserProgressService
{
    Task<UserProgressResponse> GetUserProgressAsync(Guid userId);
}
