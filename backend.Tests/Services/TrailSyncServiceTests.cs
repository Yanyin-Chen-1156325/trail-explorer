using backend.Data;
using backend.Entities;
using backend.Enums;
using backend.Integrations.Doc;
using backend.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;

namespace backend.Tests.Services;

public class TrailSyncServiceTests
{
    [Fact]
    public async Task SyncFromDocAsync_CreatesNewTrailsFromCandidates()
    {
        await using var context = CreateContext();
        var integrationService = new FakeDocTrailIntegrationService(
            [
                new DocTrailImportCandidate
                {
                    DocId = "doc-1",
                    Name = "Christchurch to Little River Rail Trail",
                    CityOrLocation = "Christchurch area",
                    Region = "Canterbury",
                    Description = "Trail introduction",
                    ImageUrl = "  https://www.doc.govt.nz/thumbs/large/link/trail.jpg  ",
                    DistanceText = "20 km",
                    DifficultyText = "Easy",
                    X = 1572954.6221,
                    Y = 5150889.4148
                }
            ]);
        var service = CreateService(context, integrationService);

        var result = await service.SyncFromDocAsync();

        Assert.True(result.Succeeded);
        Assert.Equal(1, result.CandidatesFound);
        Assert.Equal(1, result.Created);
        Assert.Equal(0, result.Updated);
        Assert.Equal(0, result.Skipped);
        Assert.Null(result.ErrorMessage);

        var trail = await context.Trails.SingleAsync();
        Assert.Equal("doc-1", trail.DocId);
        Assert.Equal("Christchurch to Little River Rail Trail", trail.Name);
        Assert.Equal("Christchurch area", trail.City);
        Assert.Equal("Canterbury", trail.Region);
        Assert.Equal("Trail introduction", trail.Description);
        Assert.Equal("https://www.doc.govt.nz/thumbs/large/link/trail.jpg", trail.ImageUrl);
        Assert.Equal(20, trail.DistanceKm);
        Assert.Equal(TrailDifficulty.Easy, trail.Difficulty);
        Assert.Equal(1572954.6221, trail.CoordinateX);
        Assert.Equal(5150889.4148, trail.CoordinateY);
        Assert.InRange(trail.Latitude.GetValueOrDefault(), -44.0, -43.0);
        Assert.InRange(trail.Longitude.GetValueOrDefault(), 172.0, 173.5);
        Assert.True(trail.IsActive);
    }

    [Fact]
    public async Task SyncFromDocAsync_UpdatesExistingTrailByDocId()
    {
        await using var context = CreateContext();
        var existingTrail = new Trail
        {
            Id = Guid.NewGuid(),
            DocId = "doc-1",
            Name = "Old name",
            City = "Old city",
            Region = "Old region",
            Description = "Old description",
            Difficulty = TrailDifficulty.Hard,
            DistanceKm = 1,
            IsActive = false,
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            UpdatedAt = DateTime.UtcNow.AddDays(-1)
        };
        context.Trails.Add(existingTrail);
        await context.SaveChangesAsync();

        var integrationService = new FakeDocTrailIntegrationService(
            [
                new DocTrailImportCandidate
                {
                    DocId = "doc-1",
                    Name = "Updated trail",
                    CityOrLocation = "Christchurch area",
                    Region = "Canterbury",
                    Description = "Updated description",
                    ImageUrl = "https://www.doc.govt.nz/thumbs/large/link/updated.jpg",
                    DistanceText = "12.5 km",
                    DifficultyText = "Moderate",
                    X = 1480769.1942,
                    Y = 5244426.8577
                }
            ]);
        var service = CreateService(context, integrationService);

        var result = await service.SyncFromDocAsync();

        Assert.True(result.Succeeded);
        Assert.Equal(1, result.CandidatesFound);
        Assert.Equal(0, result.Created);
        Assert.Equal(1, result.Updated);
        Assert.Equal(0, result.Skipped);

        var trail = await context.Trails.SingleAsync();
        Assert.Equal(existingTrail.Id, trail.Id);
        Assert.Equal("Updated trail", trail.Name);
        Assert.Equal("Christchurch area", trail.City);
        Assert.Equal("Canterbury", trail.Region);
        Assert.Equal("Updated description", trail.Description);
        Assert.Equal("https://www.doc.govt.nz/thumbs/large/link/updated.jpg", trail.ImageUrl);
        Assert.Equal(12.5m, trail.DistanceKm);
        Assert.Equal(TrailDifficulty.Moderate, trail.Difficulty);
        Assert.Equal(1480769.1942, trail.CoordinateX);
        Assert.Equal(5244426.8577, trail.CoordinateY);
        Assert.InRange(trail.Latitude.GetValueOrDefault(), -43.5, -42.5);
        Assert.InRange(trail.Longitude.GetValueOrDefault(), 170.0, 172.0);
        Assert.True(trail.IsActive);
        Assert.True(trail.UpdatedAt > existingTrail.CreatedAt);
    }

    [Fact]
    public async Task SyncFromDocAsync_SkipsCandidatesMissingRequiredFields()
    {
        await using var context = CreateContext();
        var integrationService = new FakeDocTrailIntegrationService(
            [
                new DocTrailImportCandidate
                {
                    DocId = "",
                    Name = "Missing doc ID"
                },
                new DocTrailImportCandidate
                {
                    DocId = "doc-2",
                    Name = ""
                }
            ]);
        var service = CreateService(context, integrationService);

        var result = await service.SyncFromDocAsync();

        Assert.True(result.Succeeded);
        Assert.Equal(2, result.CandidatesFound);
        Assert.Equal(0, result.Created);
        Assert.Equal(0, result.Updated);
        Assert.Equal(2, result.Skipped);
        Assert.Empty(await context.Trails.ToListAsync());
    }

    [Fact]
    public async Task SyncFromDocAsync_ReportsCreatedUpdatedAndSkippedInSameBatch()
    {
        await using var context = CreateContext();
        context.Trails.Add(new Trail
        {
            Id = Guid.NewGuid(),
            DocId = "existing-doc",
            Name = "Existing trail",
            City = "Old city",
            Region = "Old region",
            Description = "Old description",
            Difficulty = TrailDifficulty.Hard,
            DistanceKm = 1,
            IsActive = true,
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            UpdatedAt = DateTime.UtcNow.AddDays(-1)
        });
        await context.SaveChangesAsync();

        var integrationService = new FakeDocTrailIntegrationService(
            [
                new DocTrailImportCandidate
                {
                    DocId = "existing-doc",
                    Name = "Updated existing trail",
                    CityOrLocation = "Christchurch area",
                    Region = "Canterbury"
                },
                new DocTrailImportCandidate
                {
                    DocId = "new-doc",
                    Name = "New trail",
                    CityOrLocation = "Christchurch area",
                    Region = "Canterbury"
                },
                new DocTrailImportCandidate
                {
                    DocId = "",
                    Name = "Invalid trail"
                }
            ]);
        var service = CreateService(context, integrationService);

        var result = await service.SyncFromDocAsync();

        Assert.True(result.Succeeded);
        Assert.Equal(3, result.CandidatesFound);
        Assert.Equal(1, result.Created);
        Assert.Equal(1, result.Updated);
        Assert.Equal(1, result.Skipped);
        Assert.Equal(2, await context.Trails.CountAsync());
    }

    [Fact]
    public async Task SyncFromDocAsync_MapsEasiestDifficultyToEasy()
    {
        await using var context = CreateContext();
        var integrationService = new FakeDocTrailIntegrationService(
            [
                new DocTrailImportCandidate
                {
                    DocId = "doc-1",
                    Name = "Trail 1",
                    DifficultyText = "Easiest"
                }
            ]);
        var service = CreateService(context, integrationService);

        await service.SyncFromDocAsync();

        var trail = await context.Trails.SingleAsync();
        Assert.Equal(TrailDifficulty.Easy, trail.Difficulty);
        Assert.Equal(0, trail.DistanceKm);
        Assert.Equal("Unknown", trail.City);
        Assert.Equal("Unknown", trail.Region);
    }

    [Fact]
    public async Task SyncFromDocAsync_ReturnsFailedResultWhenIntegrationFails()
    {
        await using var context = CreateContext();
        var integrationService = new FakeDocTrailIntegrationService(
            [],
            throwOnSync: true);
        var service = CreateService(context, integrationService);

        var result = await service.SyncFromDocAsync();

        Assert.False(result.Succeeded);
        Assert.Equal(0, result.CandidatesFound);
        Assert.Equal(0, result.Created);
        Assert.Equal(0, result.Updated);
        Assert.Equal(0, result.Skipped);
        Assert.Equal("DOC trail synchronisation failed.", result.ErrorMessage);
    }

    private static TrailSyncService CreateService(
        ApplicationDbContext context,
        FakeDocTrailIntegrationService integrationService)
    {
        return new TrailSyncService(
            context,
            integrationService,
            new TrailCacheInvalidator(),
            NullLogger<TrailSyncService>.Instance);
    }

    private static ApplicationDbContext CreateContext()
    {
        var connection = new SqliteConnection("Data Source=:memory:");
        connection.Open();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(connection)
            .Options;

        var context = new ApplicationDbContext(options);
        context.Database.EnsureCreated();

        return context;
    }

    private sealed class FakeDocTrailIntegrationService : IDocTrailIntegrationService
    {
        private readonly IReadOnlyList<DocTrailImportCandidate> _candidates;
        private readonly bool _throwOnSync;

        public FakeDocTrailIntegrationService(
            IReadOnlyList<DocTrailImportCandidate> candidates,
            bool throwOnSync = false)
        {
            _candidates = candidates;
            _throwOnSync = throwOnSync;
        }

        public Task<IReadOnlyList<DocTrailImportCandidate>> GetImportCandidatesAsync(
            CancellationToken cancellationToken = default)
        {
            if (_throwOnSync)
            {
                throw new InvalidOperationException("DOC integration failed.");
            }

            return Task.FromResult(_candidates);
        }
    }
}
