using backend.Data;
using backend.DTOs.Trail;
using backend.Entities;
using backend.Enums;
using backend.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace backend.Tests.Services;

public class TrailServiceTests
{
    [Fact]
    public async Task GetTrailsAsync_ReturnsOnlyActiveTrailsOrderedByRegionThenName()
    {
        using var database = CreateDatabase();
        database.Context.Trails.AddRange(
            CreateTrail("doc-1", "Zeta Walk", "Canterbury", TrailDifficulty.Easy),
            CreateTrail("doc-2", "Alpha Walk", "Auckland", TrailDifficulty.Moderate),
            CreateTrail("doc-3", "Inactive Walk", "Auckland", TrailDifficulty.Hard, isActive: false),
            CreateTrail("doc-4", "Beta Walk", "Auckland", TrailDifficulty.Easy));
        await database.Context.SaveChangesAsync();
        using var serviceFixture = CreateService(database.Context);

        var response = await serviceFixture.Service.GetTrailsAsync(new TrailQueryRequest());

        Assert.Equal(3, response.TotalCount);
        Assert.Equal(["Alpha Walk", "Beta Walk", "Zeta Walk"], response.Items.Select(trail => trail.Name));
    }

    [Fact]
    public async Task GetTrailsAsync_WithSearch_MatchesNameCityRegionAndDescription()
    {
        using var database = CreateDatabase();
        database.Context.Trails.AddRange(
            CreateTrail("doc-1", "Forest Loop", "Wellington", TrailDifficulty.Easy, description: "Native bush"),
            CreateTrail("doc-2", "Harbour Track", "Christchurch", TrailDifficulty.Moderate),
            CreateTrail("doc-3", "Summit Route", "Dunedin", TrailDifficulty.Hard, region: "Canterbury"),
            CreateTrail("doc-4", "River Walk", "Nelson", TrailDifficulty.Easy, description: "Canterbury views"));
        await database.Context.SaveChangesAsync();
        using var serviceFixture = CreateService(database.Context);

        var response = await serviceFixture.Service.GetTrailsAsync(new TrailQueryRequest
        {
            Search = "canterbury"
        });

        Assert.Equal(2, response.TotalCount);
        Assert.Equal(["River Walk", "Summit Route"], response.Items.Select(trail => trail.Name).OrderBy(name => name));
    }

    [Fact]
    public async Task GetTrailsAsync_WithDifficulty_ReturnsMatchingDifficulty()
    {
        using var database = CreateDatabase();
        database.Context.Trails.AddRange(
            CreateTrail("doc-1", "Easy Walk", "Canterbury", TrailDifficulty.Easy),
            CreateTrail("doc-2", "Moderate Walk", "Canterbury", TrailDifficulty.Moderate),
            CreateTrail("doc-3", "Hard Walk", "Canterbury", TrailDifficulty.Hard));
        await database.Context.SaveChangesAsync();
        using var serviceFixture = CreateService(database.Context);

        var response = await serviceFixture.Service.GetTrailsAsync(new TrailQueryRequest
        {
            Difficulty = TrailDifficulty.Hard
        });

        Assert.Single(response.Items);
        Assert.Equal("Hard Walk", response.Items[0].Name);
        Assert.Equal(TrailDifficulty.Hard, response.Items[0].Difficulty);
    }

    [Fact]
    public async Task GetTrailsAsync_ReturnsRequestedPageWithMetadata()
    {
        using var database = CreateDatabase();
        database.Context.Trails.AddRange(
            CreateTrail("doc-1", "Trail 1", "Canterbury", TrailDifficulty.Easy),
            CreateTrail("doc-2", "Trail 2", "Canterbury", TrailDifficulty.Easy),
            CreateTrail("doc-3", "Trail 3", "Canterbury", TrailDifficulty.Easy));
        await database.Context.SaveChangesAsync();
        using var serviceFixture = CreateService(database.Context);

        var response = await serviceFixture.Service.GetTrailsAsync(new TrailQueryRequest
        {
            PageNumber = 2,
            PageSize = 2
        });

        Assert.Equal(2, response.PageNumber);
        Assert.Equal(2, response.PageSize);
        Assert.Equal(3, response.TotalCount);
        Assert.Equal(2, response.TotalPages);
        Assert.Single(response.Items);
        Assert.Equal("Trail 3", response.Items[0].Name);
    }

    [Fact]
    public async Task GetTrailByIdAsync_WhenTrailIsActive_ReturnsTrail()
    {
        using var database = CreateDatabase();
        var trail = CreateTrail("doc-1", "Active Trail", "Canterbury", TrailDifficulty.Easy);
        database.Context.Trails.Add(trail);
        await database.Context.SaveChangesAsync();
        using var serviceFixture = CreateService(database.Context);

        var response = await serviceFixture.Service.GetTrailByIdAsync(trail.Id);

        Assert.NotNull(response);
        Assert.Equal(trail.Id, response.Id);
        Assert.Equal("Active Trail", response.Name);
    }

    [Fact]
    public async Task GetTrailByIdAsync_WhenTrailIsInactive_ReturnsNull()
    {
        using var database = CreateDatabase();
        var trail = CreateTrail("doc-1", "Inactive Trail", "Canterbury", TrailDifficulty.Easy, isActive: false);
        database.Context.Trails.Add(trail);
        await database.Context.SaveChangesAsync();
        using var serviceFixture = CreateService(database.Context);

        var response = await serviceFixture.Service.GetTrailByIdAsync(trail.Id);

        Assert.Null(response);
    }

    [Fact]
    public async Task GetTrailsAsync_CachesListUntilInvalidated()
    {
        using var database = CreateDatabase();
        database.Context.Trails.Add(CreateTrail("doc-1", "Original Trail", "Canterbury", TrailDifficulty.Easy));
        await database.Context.SaveChangesAsync();
        using var serviceFixture = CreateService(database.Context);

        var firstResponse = await serviceFixture.Service.GetTrailsAsync(new TrailQueryRequest());
        database.Context.Trails.Add(CreateTrail("doc-2", "New Trail", "Canterbury", TrailDifficulty.Easy));
        await database.Context.SaveChangesAsync();

        var cachedResponse = await serviceFixture.Service.GetTrailsAsync(new TrailQueryRequest());
        serviceFixture.CacheInvalidator.InvalidateTrailList();
        var refreshedResponse = await serviceFixture.Service.GetTrailsAsync(new TrailQueryRequest());

        Assert.Equal(1, firstResponse.TotalCount);
        Assert.Equal(1, cachedResponse.TotalCount);
        Assert.Equal(2, refreshedResponse.TotalCount);
    }

    [Fact]
    public async Task GetTrailByIdAsync_CachesDetailsUntilInvalidated()
    {
        using var database = CreateDatabase();
        var trail = CreateTrail("doc-1", "Original Trail", "Canterbury", TrailDifficulty.Easy);
        database.Context.Trails.Add(trail);
        await database.Context.SaveChangesAsync();
        using var serviceFixture = CreateService(database.Context);

        var firstResponse = await serviceFixture.Service.GetTrailByIdAsync(trail.Id);
        trail.Name = "Updated Trail";
        await database.Context.SaveChangesAsync();

        var cachedResponse = await serviceFixture.Service.GetTrailByIdAsync(trail.Id);
        serviceFixture.CacheInvalidator.InvalidateTrailDetails();
        var refreshedResponse = await serviceFixture.Service.GetTrailByIdAsync(trail.Id);

        Assert.Equal("Original Trail", firstResponse?.Name);
        Assert.Equal("Original Trail", cachedResponse?.Name);
        Assert.Equal("Updated Trail", refreshedResponse?.Name);
    }

    private static Trail CreateTrail(
        string docId,
        string name,
        string city,
        TrailDifficulty difficulty,
        bool isActive = true,
        string? region = null,
        string? description = null)
    {
        var now = DateTime.UtcNow;

        return new Trail
        {
            Id = Guid.NewGuid(),
            DocId = docId,
            Name = name,
            City = city,
            Region = region ?? city,
            Difficulty = difficulty,
            DistanceKm = 5,
            Description = description ?? $"{name} description",
            IsActive = isActive,
            CreatedAt = now,
            UpdatedAt = now
        };
    }

    private static TrailServiceFixture CreateService(ApplicationDbContext context)
    {
        var cache = new MemoryCache(new MemoryCacheOptions());
        var cacheInvalidator = new TrailCacheInvalidator();

        return new TrailServiceFixture(
            new TrailService(context, cache, cacheInvalidator),
            cache,
            cacheInvalidator);
    }

    private static TestDatabase CreateDatabase()
    {
        return new TestDatabase();
    }

    private sealed class TrailServiceFixture : IDisposable
    {
        private readonly IMemoryCache _cache;

        public TrailServiceFixture(
            TrailService service,
            IMemoryCache cache,
            TrailCacheInvalidator cacheInvalidator)
        {
            Service = service;
            _cache = cache;
            CacheInvalidator = cacheInvalidator;
        }

        public TrailService Service { get; }

        public TrailCacheInvalidator CacheInvalidator { get; }

        public void Dispose()
        {
            _cache.Dispose();
            CacheInvalidator.Dispose();
        }
    }

    private sealed class TestDatabase : IDisposable
    {
        private readonly SqliteConnection _connection;

        public TestDatabase()
        {
            _connection = new SqliteConnection("Data Source=:memory:");
            _connection.Open();

            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlite(_connection)
                .Options;

            Context = new ApplicationDbContext(options);
            Context.Database.EnsureCreated();
        }

        public ApplicationDbContext Context { get; }

        public void Dispose()
        {
            Context.Dispose();
            _connection.Dispose();
        }
    }
}
