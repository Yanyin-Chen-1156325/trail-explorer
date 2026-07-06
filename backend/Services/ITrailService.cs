using backend.DTOs.Trail;

namespace backend.Services;

public interface ITrailService
{
    Task<PagedTrailResponse> GetTrailsAsync(TrailQueryRequest query);

    Task<TrailResponse?> GetTrailByIdAsync(Guid trailId);
}
