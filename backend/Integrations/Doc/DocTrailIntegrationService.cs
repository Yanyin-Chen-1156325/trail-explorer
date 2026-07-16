using backend.Integrations.Doc.DTOs;
using Microsoft.Extensions.Options;

namespace backend.Integrations.Doc;

public class DocTrailIntegrationService : IDocTrailIntegrationService
{
    private readonly IDocApiClient _docApiClient;
    private readonly DocApiOptions _options;
    private readonly ILogger<DocTrailIntegrationService> _logger;

    public DocTrailIntegrationService(
        IDocApiClient docApiClient,
        IOptions<DocApiOptions> options,
        ILogger<DocTrailIntegrationService> logger)
    {
        _docApiClient = docApiClient;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<IReadOnlyList<DocTrailImportCandidate>> GetImportCandidatesAsync(
        CancellationToken cancellationToken = default)
    {
        IReadOnlyList<DocTrackSummaryDto> tracks;

        try
        {
            _logger.LogInformation("Retrieving DOC track list.");
            tracks = await _docApiClient.GetTracksAsync(cancellationToken);
            _logger.LogInformation(
                "Retrieved {TrackCount} DOC tracks before filtering.",
                tracks.Count);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Failed to retrieve DOC tracks.");
            return [];
        }
        catch (TaskCanceledException ex)
        {
            _logger.LogError(ex, "Timed out while retrieving DOC tracks.");
            return [];
        }

        var candidates = new List<DocTrailImportCandidate>();
        var regionMatches = tracks.Where(IsTargetRegion).ToList();
        var missingAssetIdCount = 0;
        var locationSkippedCount = 0;
        var invalidCandidateCount = 0;

        _logger.LogInformation(
            "DOC region filter matched {RegionMatchCount} of {TrackCount} tracks. TargetRegions: {TargetRegions}.",
            regionMatches.Count,
            tracks.Count,
            string.Join(", ", _options.TargetRegions));

        foreach (var track in regionMatches)
        {
            if (string.IsNullOrWhiteSpace(track.AssetId))
            {
                missingAssetIdCount++;
                continue;
            }

            var detail = await GetTrackDetailAsync(track.AssetId, cancellationToken);

            if (detail is null)
            {
                continue;
            }

            if (!IsTargetLocation(detail))
            {
                locationSkippedCount++;
                continue;
            }

            var candidate = MapCandidate(track, detail);

            if (!string.IsNullOrWhiteSpace(candidate.DocId) &&
                !string.IsNullOrWhiteSpace(candidate.Name))
            {
                candidates.Add(candidate);
                continue;
            }

            invalidCandidateCount++;
        }

        _logger.LogInformation(
            "DOC import candidate filtering completed. Candidates: {CandidateCount}, MissingAssetId: {MissingAssetIdCount}, LocationSkipped: {LocationSkippedCount}, InvalidCandidates: {InvalidCandidateCount}, TargetLocationKeywords: {TargetLocationKeywords}.",
            candidates.Count,
            missingAssetIdCount,
            locationSkippedCount,
            invalidCandidateCount,
            string.Join(", ", _options.TargetLocationKeywords));

        return candidates;
    }

    private async Task<DocTrackDetailDto?> GetTrackDetailAsync(
        string assetId,
        CancellationToken cancellationToken)
    {
        try
        {
            return await _docApiClient.GetTrackDetailAsync(assetId, cancellationToken);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogWarning(ex, "Failed to retrieve DOC track detail for asset ID {AssetId}.", assetId);
            return null;
        }
        catch (TaskCanceledException ex)
        {
            _logger.LogWarning(ex, "Timed out while retrieving DOC track detail for asset ID {AssetId}.", assetId);
            return null;
        }
    }

    private bool IsTargetRegion(DocTrackSummaryDto track)
    {
        return MatchesAny(track.Region, _options.TargetRegions);
    }

    private bool IsTargetLocation(DocTrackDetailDto detail)
    {
        if (_options.TargetLocationKeywords.Length == 0)
        {
            return true;
        }

        var locations = new List<string>();

        if (detail.LocationArray is not null)
        {
            locations.AddRange(detail.LocationArray);
        }

        if (!string.IsNullOrWhiteSpace(detail.LocationString))
        {
            locations.Add(detail.LocationString);
        }

        return MatchesAny(locations, _options.TargetLocationKeywords);
    }

    private static bool MatchesAny(IEnumerable<string>? values, IReadOnlyCollection<string> targets)
    {
        if (targets.Count == 0)
        {
            return true;
        }

        return values?.Any(value =>
            targets.Any(target =>
                !string.IsNullOrWhiteSpace(value) &&
                !string.IsNullOrWhiteSpace(target) &&
                value.Contains(target, StringComparison.OrdinalIgnoreCase))) == true;
    }

    private static DocTrailImportCandidate MapCandidate(
        DocTrackSummaryDto summary,
        DocTrackDetailDto detail)
    {
        return new DocTrailImportCandidate
        {
            DocId = detail.AssetId ?? summary.AssetId ?? string.Empty,
            Name = detail.Name ?? summary.Name ?? string.Empty,
            Region = detail.Region?.FirstOrDefault() ?? summary.Region?.FirstOrDefault(),
            CityOrLocation = detail.LocationArray?.FirstOrDefault() ?? detail.LocationString,
            Description = detail.Introduction,
            ImageUrl = detail.IntroductionThumbnail,
            DistanceText = detail.Distance,
            DifficultyText = detail.WalkTrackCategory?.FirstOrDefault() ??
                detail.MtbTrackCategory?.FirstOrDefault(),
            StaticLink = detail.StaticLink,
            X = detail.X ?? summary.X,
            Y = detail.Y ?? summary.Y
        };
    }
}
