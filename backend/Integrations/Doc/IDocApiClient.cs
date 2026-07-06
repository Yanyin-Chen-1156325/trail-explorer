using backend.Integrations.Doc.DTOs;

namespace backend.Integrations.Doc;

public interface IDocApiClient
{
    Task<IReadOnlyList<DocTrackSummaryDto>> GetTracksAsync(CancellationToken cancellationToken = default);

    Task<DocTrackDetailDto?> GetTrackDetailAsync(string assetId, CancellationToken cancellationToken = default);
}
