using backend.Data;
using backend.DTOs.Trail;
using backend.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class TrailService : ITrailService
{
    private readonly ApplicationDbContext _context;

    public TrailService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<TrailResponse>> GetTrailsAsync()
    {
        return await _context.Trails
            .AsNoTracking()
            .Where(trail => trail.IsActive)
            .OrderBy(trail => trail.Region)
            .ThenBy(trail => trail.Name)
            .Select(trail => ToTrailResponse(trail))
            .ToListAsync();
    }

    public async Task<TrailResponse?> GetTrailByIdAsync(Guid trailId)
    {
        return await _context.Trails
            .AsNoTracking()
            .Where(trail => trail.Id == trailId && trail.IsActive)
            .Select(trail => ToTrailResponse(trail))
            .FirstOrDefaultAsync();
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
            CreatedAt = trail.CreatedAt,
            UpdatedAt = trail.UpdatedAt
        };
    }
}
