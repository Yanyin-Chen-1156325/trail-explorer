using backend.DTOs.Trail;

namespace backend.Services;

public interface ITrailService
{
    Task<IReadOnlyList<TrailResponse>> GetTrailsAsync();

    Task<TrailResponse?> GetTrailByIdAsync(Guid trailId);
}
