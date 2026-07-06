using backend.DTOs.Trail;

namespace backend.Services;

public interface ITrailSyncService
{
    Task<TrailSyncResult> SyncFromDocAsync(CancellationToken cancellationToken = default);
}
