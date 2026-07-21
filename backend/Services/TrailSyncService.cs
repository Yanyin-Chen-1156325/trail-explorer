using backend.DTOs.Trail;
using backend.Data;
using backend.Entities;
using backend.Enums;
using backend.Integrations.Doc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace backend.Services;

public class TrailSyncService : ITrailSyncService
{
    private readonly ApplicationDbContext _context;
    private readonly IDocTrailIntegrationService _docTrailIntegrationService;
    private readonly ITrailCacheInvalidator _cacheInvalidator;
    private readonly ILogger<TrailSyncService> _logger;

    public TrailSyncService(
        ApplicationDbContext context,
        IDocTrailIntegrationService docTrailIntegrationService,
        ITrailCacheInvalidator cacheInvalidator,
        ILogger<TrailSyncService> logger)
    {
        _context = context;
        _docTrailIntegrationService = docTrailIntegrationService;
        _cacheInvalidator = cacheInvalidator;
        _logger = logger;
    }

    public async Task<TrailSyncResult> SyncFromDocAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("DOC trail synchronisation started.");

            var candidates = await _docTrailIntegrationService.GetImportCandidatesAsync(cancellationToken);

            _logger.LogInformation(
                "DOC trail synchronisation found {CandidatesFound} import candidates.",
                candidates.Count);

            var result = new TrailSyncResult
            {
                Succeeded = true,
                CandidatesFound = candidates.Count
            };
            var now = DateTime.UtcNow;

            foreach (var candidate in candidates)
            {
                if (string.IsNullOrWhiteSpace(candidate.DocId) ||
                    string.IsNullOrWhiteSpace(candidate.Name))
                {
                    _logger.LogWarning(
                        "Skipping DOC trail import candidate because required fields are missing. HasDocId: {HasDocId}, HasName: {HasName}.",
                        !string.IsNullOrWhiteSpace(candidate.DocId),
                        !string.IsNullOrWhiteSpace(candidate.Name));
                    result.Skipped++;
                    continue;
                }

                var existingTrail = await _context.Trails
                    .FirstOrDefaultAsync(trail => trail.DocId == candidate.DocId, cancellationToken);

                if (existingTrail is null)
                {
                    var trail = CreateTrail(candidate, now);
                    _context.Trails.Add(trail);
                    result.Created++;
                    continue;
                }

                UpdateTrail(existingTrail, candidate, now);
                result.Updated++;
            }

            await _context.SaveChangesAsync(cancellationToken);

            if (result.Created > 0 || result.Updated > 0)
            {
                _cacheInvalidator.InvalidateTrailList();
                _cacheInvalidator.InvalidateTrailDetails();
            }

            _logger.LogInformation(
                "DOC trail synchronisation completed. Candidates: {CandidatesFound}, Created: {Created}, Updated: {Updated}, Skipped: {Skipped}.",
                result.CandidatesFound,
                result.Created,
                result.Updated,
                result.Skipped);

            return new TrailSyncResult
            {
                Succeeded = true,
                CandidatesFound = result.CandidatesFound,
                Created = result.Created,
                Updated = result.Updated,
                Skipped = result.Skipped
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "DOC trail synchronisation failed.");

            return new TrailSyncResult
            {
                Succeeded = false,
                ErrorMessage = "DOC trail synchronisation failed."
            };
        }
    }

    private static Trail CreateTrail(DocTrailImportCandidate candidate, DateTime now)
    {
        var coordinates = CoordinateConversionService.ConvertNztmToWgs84(candidate.X, candidate.Y);

        return new Trail
        {
            Id = Guid.NewGuid(),
            DocId = candidate.DocId.Trim(),
            Name = candidate.Name.Trim(),
            City = NormalizeRequiredText(candidate.CityOrLocation, "Unknown"),
            Region = NormalizeRequiredText(candidate.Region, "Unknown"),
            Difficulty = MapDifficulty(candidate.DifficultyText),
            DistanceKm = ParseDistanceKm(candidate.DistanceText),
            Description = candidate.Description?.Trim() ?? string.Empty,
            ImageUrl = NormalizeOptionalText(candidate.ImageUrl),
            CoordinateX = candidate.X,
            CoordinateY = candidate.Y,
            Latitude = coordinates?.Latitude,
            Longitude = coordinates?.Longitude,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };
    }

    private static void UpdateTrail(
        Trail trail,
        DocTrailImportCandidate candidate,
        DateTime now)
    {
        trail.Name = candidate.Name.Trim();
        trail.City = NormalizeRequiredText(candidate.CityOrLocation, "Unknown");
        trail.Region = NormalizeRequiredText(candidate.Region, "Unknown");
        trail.Difficulty = MapDifficulty(candidate.DifficultyText);
        trail.DistanceKm = ParseDistanceKm(candidate.DistanceText);
        trail.Description = candidate.Description?.Trim() ?? string.Empty;
        trail.ImageUrl = NormalizeOptionalText(candidate.ImageUrl);
        trail.CoordinateX = candidate.X;
        trail.CoordinateY = candidate.Y;
        var coordinates = CoordinateConversionService.ConvertNztmToWgs84(candidate.X, candidate.Y);
        trail.Latitude = coordinates?.Latitude;
        trail.Longitude = coordinates?.Longitude;
        trail.IsActive = true;
        trail.UpdatedAt = now;
    }

    private static string NormalizeRequiredText(string? value, string fallback)
    {
        return string.IsNullOrWhiteSpace(value)
            ? fallback
            : value.Trim();
    }

    private static string? NormalizeOptionalText(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }

    private static decimal ParseDistanceKm(string? distanceText)
    {
        if (string.IsNullOrWhiteSpace(distanceText))
        {
            return 0;
        }

        var numericText = new string(distanceText
            .TakeWhile(character =>
                char.IsDigit(character) ||
                character == '.' ||
                character == ',')
            .ToArray())
            .Replace(",", string.Empty);

        return decimal.TryParse(
            numericText,
            NumberStyles.Number,
            CultureInfo.InvariantCulture,
            out var distanceKm)
                ? distanceKm
                : 0;
    }

    private static TrailDifficulty MapDifficulty(string? difficultyText)
    {
        if (string.IsNullOrWhiteSpace(difficultyText))
        {
            return TrailDifficulty.Easy;
        }

        return difficultyText.Trim().ToLowerInvariant() switch
        {
            "easy access" or "easiest" or "easy" => TrailDifficulty.Easy,
            "intermediate" or "moderate" => TrailDifficulty.Intermediate,
            "advanced" or "hard" => TrailDifficulty.Advanced,
            "expert" => TrailDifficulty.Expert,
            _ => TrailDifficulty.Easy
        };
    }
}
