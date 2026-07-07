using System.Net;
using System.Net.Http.Json;
using backend.Data;
using backend.DTOs.Trail;
using backend.Entities;
using backend.Enums;
using backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace backend.Tests.Integration.Trails;

public class TrailApiIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public TrailApiIntegrationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetTrails_ReturnsActiveTrailsWithPaginationMetadata()
    {
        var client = _factory.CreateClient();
        await ResetTrailsAsync();
        var activeTrail = CreateTrail("api-list-active", "Alpine Loop", "Auckland", TrailDifficulty.Easy);
        var secondActiveTrail = CreateTrail("api-list-second", "Bush Track", "Wellington", TrailDifficulty.Moderate);
        var inactiveTrail = CreateTrail(
            "api-list-inactive",
            "Closed Ridge",
            "Canterbury",
            TrailDifficulty.Hard,
            isActive: false);
        await SeedTrailsAsync(activeTrail, secondActiveTrail, inactiveTrail);

        var response = await client.GetAsync("/api/trails?pageNumber=1&pageSize=10");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var trails = await response.Content.ReadFromJsonAsync<PagedTrailResponse>();
        Assert.NotNull(trails);
        Assert.Equal(1, trails.PageNumber);
        Assert.Equal(10, trails.PageSize);
        Assert.Equal(2, trails.TotalCount);
        Assert.Equal(1, trails.TotalPages);
        Assert.Contains(trails.Items, trail => trail.Id == activeTrail.Id && trail.Name == activeTrail.Name);
        Assert.Contains(trails.Items, trail => trail.Id == secondActiveTrail.Id && trail.Name == secondActiveTrail.Name);
        Assert.DoesNotContain(trails.Items, trail => trail.Id == inactiveTrail.Id);
    }

    [Fact]
    public async Task GetTrailById_WithActiveTrail_ReturnsTrail()
    {
        var client = _factory.CreateClient();
        await ResetTrailsAsync();
        var trail = CreateTrail("api-detail-active", "Summit Route", "Nelson", TrailDifficulty.Hard);
        await SeedTrailsAsync(trail);

        var response = await client.GetAsync($"/api/trails/{trail.Id}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var trailResponse = await response.Content.ReadFromJsonAsync<TrailResponse>();
        Assert.NotNull(trailResponse);
        Assert.Equal(trail.Id, trailResponse.Id);
        Assert.Equal(trail.DocId, trailResponse.DocId);
        Assert.Equal(trail.Name, trailResponse.Name);
        Assert.Equal(trail.Difficulty, trailResponse.Difficulty);
    }

    [Fact]
    public async Task GetTrailById_WithInactiveTrail_ReturnsNotFound()
    {
        var client = _factory.CreateClient();
        await ResetTrailsAsync();
        var trail = CreateTrail(
            "api-detail-inactive",
            "Closed Summit",
            "Otago",
            TrailDifficulty.Hard,
            isActive: false);
        await SeedTrailsAsync(trail);

        var response = await client.GetAsync($"/api/trails/{trail.Id}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("Trail not found", body);
    }

    [Fact]
    public async Task GetTrailById_WithMissingTrail_ReturnsNotFound()
    {
        var client = _factory.CreateClient();
        await ResetTrailsAsync();

        var response = await client.GetAsync($"/api/trails/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("Trail not found", body);
    }

    [Fact]
    public async Task GetTrails_WithInvalidQuery_ReturnsValidationErrors()
    {
        var client = _factory.CreateClient();
        await ResetTrailsAsync();

        var response = await client.GetAsync("/api/trails?pageNumber=0&pageSize=101");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("Validation failed", body);
        Assert.Contains("Page number must be greater than or equal to 1", body);
        Assert.Contains("Page size must be between 1 and 100", body);
    }

    [Fact]
    public async Task GetTrails_WithSearch_MatchesNameCityRegionAndDescription()
    {
        var client = _factory.CreateClient();
        await ResetTrailsAsync();
        var nameMatch = CreateTrail("search-name", "Canterbury Ridge", "Auckland", TrailDifficulty.Easy);
        var cityMatch = CreateTrail("search-city", "Harbour Path", "Canterbury", TrailDifficulty.Moderate);
        var regionMatch = CreateTrail(
            "search-region",
            "Forest Loop",
            "Nelson",
            TrailDifficulty.Easy,
            region: "Canterbury");
        var descriptionMatch = CreateTrail(
            "search-description",
            "River Walk",
            "Otago",
            TrailDifficulty.Hard,
            description: "A route with Canterbury foothill views.");
        var nonMatch = CreateTrail("search-non-match", "Coastal Track", "Wellington", TrailDifficulty.Easy);
        await SeedTrailsAsync(nameMatch, cityMatch, regionMatch, descriptionMatch, nonMatch);

        var response = await client.GetAsync("/api/trails?search=canterbury&pageNumber=1&pageSize=10");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var trails = await response.Content.ReadFromJsonAsync<PagedTrailResponse>();
        Assert.NotNull(trails);
        Assert.Equal(4, trails.TotalCount);
        Assert.Contains(trails.Items, trail => trail.Id == nameMatch.Id);
        Assert.Contains(trails.Items, trail => trail.Id == cityMatch.Id);
        Assert.Contains(trails.Items, trail => trail.Id == regionMatch.Id);
        Assert.Contains(trails.Items, trail => trail.Id == descriptionMatch.Id);
        Assert.DoesNotContain(trails.Items, trail => trail.Id == nonMatch.Id);
    }

    [Fact]
    public async Task GetTrails_WithSearch_TrimsSearchAndExcludesInactiveTrails()
    {
        var client = _factory.CreateClient();
        await ResetTrailsAsync();
        var activeTrail = CreateTrail("search-active", "Summit Track", "Auckland", TrailDifficulty.Easy);
        var inactiveTrail = CreateTrail(
            "search-inactive",
            "Summit Route",
            "Auckland",
            TrailDifficulty.Hard,
            isActive: false);
        await SeedTrailsAsync(activeTrail, inactiveTrail);

        var response = await client.GetAsync("/api/trails?search=%20%20SUMMIT%20%20&pageNumber=1&pageSize=10");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var trails = await response.Content.ReadFromJsonAsync<PagedTrailResponse>();
        Assert.NotNull(trails);
        Assert.Equal(1, trails.TotalCount);
        Assert.Single(trails.Items);
        Assert.Equal(activeTrail.Id, trails.Items[0].Id);
    }

    [Fact]
    public async Task GetTrails_WithSearchAndNoMatches_ReturnsEmptyPagedResponse()
    {
        var client = _factory.CreateClient();
        await ResetTrailsAsync();
        await SeedTrailsAsync(CreateTrail("search-empty", "Forest Loop", "Wellington", TrailDifficulty.Easy));

        var response = await client.GetAsync("/api/trails?search=glacier&pageNumber=1&pageSize=10");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var trails = await response.Content.ReadFromJsonAsync<PagedTrailResponse>();
        Assert.NotNull(trails);
        Assert.Empty(trails.Items);
        Assert.Equal(0, trails.TotalCount);
        Assert.Equal(0, trails.TotalPages);
    }

    [Fact]
    public async Task GetTrails_WithDifficultyFilter_ReturnsOnlyMatchingActiveTrails()
    {
        var client = _factory.CreateClient();
        await ResetTrailsAsync();
        var easyTrail = CreateTrail("filter-easy", "Forest Loop", "Auckland", TrailDifficulty.Easy);
        var firstHardTrail = CreateTrail("filter-hard-1", "Summit Route", "Canterbury", TrailDifficulty.Hard);
        var secondHardTrail = CreateTrail("filter-hard-2", "Ridge Track", "Otago", TrailDifficulty.Hard);
        var moderateTrail = CreateTrail("filter-moderate", "Harbour Path", "Wellington", TrailDifficulty.Moderate);
        await SeedTrailsAsync(easyTrail, firstHardTrail, secondHardTrail, moderateTrail);

        var response = await client.GetAsync("/api/trails?difficulty=Hard&pageNumber=1&pageSize=10");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var trails = await response.Content.ReadFromJsonAsync<PagedTrailResponse>();
        Assert.NotNull(trails);
        Assert.Equal(2, trails.TotalCount);
        Assert.All(trails.Items, trail => Assert.Equal(TrailDifficulty.Hard, trail.Difficulty));
        Assert.Contains(trails.Items, trail => trail.Id == firstHardTrail.Id);
        Assert.Contains(trails.Items, trail => trail.Id == secondHardTrail.Id);
        Assert.DoesNotContain(trails.Items, trail => trail.Id == easyTrail.Id);
        Assert.DoesNotContain(trails.Items, trail => trail.Id == moderateTrail.Id);
    }

    [Fact]
    public async Task GetTrails_WithDifficultyFilter_ExcludesInactiveTrails()
    {
        var client = _factory.CreateClient();
        await ResetTrailsAsync();
        var activeTrail = CreateTrail("filter-active", "Open Easy Trail", "Auckland", TrailDifficulty.Easy);
        var inactiveTrail = CreateTrail(
            "filter-inactive",
            "Closed Easy Trail",
            "Auckland",
            TrailDifficulty.Easy,
            isActive: false);
        await SeedTrailsAsync(activeTrail, inactiveTrail);

        var response = await client.GetAsync("/api/trails?difficulty=Easy&pageNumber=1&pageSize=10");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var trails = await response.Content.ReadFromJsonAsync<PagedTrailResponse>();
        Assert.NotNull(trails);
        Assert.Single(trails.Items);
        Assert.Equal(1, trails.TotalCount);
        Assert.Equal(activeTrail.Id, trails.Items[0].Id);
    }

    [Fact]
    public async Task GetTrails_WithDifficultyFilter_ReturnsFilteredPaginationMetadata()
    {
        var client = _factory.CreateClient();
        await ResetTrailsAsync();
        await SeedTrailsAsync(
            CreateTrail("filter-page-1", "Easy Trail 1", "Auckland", TrailDifficulty.Easy),
            CreateTrail("filter-page-2", "Easy Trail 2", "Auckland", TrailDifficulty.Easy),
            CreateTrail("filter-page-3", "Easy Trail 3", "Auckland", TrailDifficulty.Easy),
            CreateTrail("filter-page-hard", "Hard Trail", "Auckland", TrailDifficulty.Hard));

        var response = await client.GetAsync("/api/trails?difficulty=Easy&pageNumber=2&pageSize=2");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var trails = await response.Content.ReadFromJsonAsync<PagedTrailResponse>();
        Assert.NotNull(trails);
        Assert.Equal(2, trails.PageNumber);
        Assert.Equal(2, trails.PageSize);
        Assert.Equal(3, trails.TotalCount);
        Assert.Equal(2, trails.TotalPages);
        Assert.Single(trails.Items);
        Assert.All(trails.Items, trail => Assert.Equal(TrailDifficulty.Easy, trail.Difficulty));
    }

    [Fact]
    public async Task GetTrails_WithInvalidDifficultyFilter_ReturnsBadRequest()
    {
        var client = _factory.CreateClient();
        await ResetTrailsAsync();

        var response = await client.GetAsync("/api/trails?difficulty=999&pageNumber=1&pageSize=10");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("difficulty", body, StringComparison.OrdinalIgnoreCase);
    }

    private async Task ResetTrailsAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        dbContext.Trails.RemoveRange(await dbContext.Trails.ToListAsync());
        await dbContext.SaveChangesAsync();

        InvalidateTrailCache(scope.ServiceProvider);
    }

    private async Task SeedTrailsAsync(params Trail[] trails)
    {
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        dbContext.Trails.AddRange(trails);
        await dbContext.SaveChangesAsync();

        InvalidateTrailCache(scope.ServiceProvider);
    }

    private static void InvalidateTrailCache(IServiceProvider serviceProvider)
    {
        var cacheInvalidator = serviceProvider.GetRequiredService<ITrailCacheInvalidator>();

        cacheInvalidator.InvalidateTrailList();
        cacheInvalidator.InvalidateTrailDetails();
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
            DistanceKm = 7.5m,
            Description = description ?? $"{name} integration test trail",
            IsActive = isActive,
            CreatedAt = now,
            UpdatedAt = now
        };
    }
}
