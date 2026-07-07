using backend.Data;
using backend.DTOs.Trail;
using backend.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace backend.Services;

public class TrailService : ITrailService
{
    private static readonly TimeSpan TrailListCacheDuration = TimeSpan.FromMinutes(5);
    private static readonly TimeSpan TrailDetailsCacheDuration = TimeSpan.FromMinutes(5);

    private readonly ApplicationDbContext _context;
    private readonly IMemoryCache _cache;
    private readonly ITrailCacheInvalidator _cacheInvalidator;

    public TrailService(
        ApplicationDbContext context,
        IMemoryCache cache,
        ITrailCacheInvalidator cacheInvalidator)
    {
        _context = context;
        _cache = cache;
        _cacheInvalidator = cacheInvalidator;
    }

    public async Task<PagedTrailResponse> GetTrailsAsync(TrailQueryRequest query)
    {
        var cacheKey = CreateTrailListCacheKey(query);

        if (_cache.TryGetValue(cacheKey, out PagedTrailResponse? cachedResponse) &&
            cachedResponse is not null)
        {
            return cachedResponse;
        }

        var trailsQuery = _context.Trails
            .AsNoTracking()
            .Where(trail => trail.IsActive);

        var search = query.Search?.Trim();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalizedSearch = search.ToLower();

            trailsQuery = trailsQuery.Where(trail =>
                trail.Name.ToLower().Contains(normalizedSearch) ||
                trail.City.ToLower().Contains(normalizedSearch) ||
                trail.Region.ToLower().Contains(normalizedSearch) ||
                trail.Description.ToLower().Contains(normalizedSearch));
        }

        if (query.Difficulty.HasValue)
        {
            trailsQuery = trailsQuery.Where(trail =>
                trail.Difficulty == query.Difficulty.Value);
        }

        var totalCount = await trailsQuery.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize);
        var skip = (query.PageNumber - 1) * query.PageSize;

        var trails = await trailsQuery
            .OrderBy(trail => trail.Region)
            .ThenBy(trail => trail.Name)
            .Skip(skip)
            .Take(query.PageSize)
            .Select(trail => ToTrailResponse(trail))
            .ToListAsync();

        var response = new PagedTrailResponse
        {
            Items = trails,
            PageNumber = query.PageNumber,
            PageSize = query.PageSize,
            TotalCount = totalCount,
            TotalPages = totalPages
        };

        _cache.Set(
            cacheKey,
            response,
            new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TrailListCacheDuration)
                .AddExpirationToken(_cacheInvalidator.TrailListToken));

        return response;
    }

    public async Task<TrailResponse?> GetTrailByIdAsync(Guid trailId)
    {
        var cacheKey = CreateTrailDetailsCacheKey(trailId);

        if (_cache.TryGetValue(cacheKey, out TrailResponse? cachedResponse))
        {
            return cachedResponse;
        }

        var response = await _context.Trails
            .AsNoTracking()
            .Where(trail => trail.Id == trailId && trail.IsActive)
            .Select(trail => ToTrailResponse(trail))
            .FirstOrDefaultAsync();

        if (response is not null)
        {
            _cache.Set(
                cacheKey,
                response,
                new MemoryCacheEntryOptions()
                    .SetAbsoluteExpiration(TrailDetailsCacheDuration)
                    .AddExpirationToken(_cacheInvalidator.TrailDetailsToken));
        }

        return response;
    }

    private static TrailResponse ToTrailResponse(Trail trail)
    {
        return new TrailResponse
        {
            Id = trail.Id,
            DocId = trail.DocId,
            Name = trail.Name,
            City = trail.City,
            Region = trail.Region,
            Difficulty = trail.Difficulty,
            DistanceKm = trail.DistanceKm,
            Description = trail.Description,
            Latitude = trail.Latitude,
            Longitude = trail.Longitude,
            CreatedAt = trail.CreatedAt,
            UpdatedAt = trail.UpdatedAt
        };
    }

    private static string CreateTrailListCacheKey(TrailQueryRequest query)
    {
        var normalizedSearch = query.Search?.Trim().ToLowerInvariant() ?? string.Empty;
        var difficulty = query.Difficulty?.ToString() ?? "all";

        return string.Join(
            ':',
            "trail-list",
            normalizedSearch,
            difficulty,
            query.PageNumber,
            query.PageSize);
    }

    private static string CreateTrailDetailsCacheKey(Guid trailId)
    {
        return string.Join(':', "trail-detail", trailId);
    }
}
