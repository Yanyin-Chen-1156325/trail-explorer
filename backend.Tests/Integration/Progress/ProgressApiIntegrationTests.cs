using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using backend.Authentication;
using backend.Data;
using backend.DTOs.Gamification;
using backend.Entities;
using backend.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace backend.Tests.Integration.Progress;

public class ProgressApiIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public ProgressApiIntegrationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetMyProgress_WithAuthenticatedUser_ReturnsCurrentUserProgress()
    {
        var client = _factory.CreateClient();
        await ResetProgressDataAsync();
        var user = await SeedUserAsync("progress.user@example.com", UserRole.User);
        var otherUser = await SeedUserAsync("other.progress.user@example.com", UserRole.User);
        var easyTrail = await SeedTrailAsync("progress-easy-trail", "Progress Easy Trail", 5m, TrailDifficulty.Easy);
        var hardTrail = await SeedTrailAsync("progress-hard-trail", "Progress Hard Trail", 10m, TrailDifficulty.Hard);
        await SeedCheckInAsync(user.Id, easyTrail.Id);
        await SeedCheckInAsync(user.Id, hardTrail.Id);
        await SeedCheckInAsync(user.Id, hardTrail.Id, isHidden: true);
        await SeedCheckInAsync(otherUser.Id, hardTrail.Id);
        client.DefaultRequestHeaders.Authorization = CreateAuthorizationHeader(user);

        var response = await client.GetAsync("/api/progress/me");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var progress = await response.Content.ReadFromJsonAsync<UserProgressResponse>();
        Assert.NotNull(progress);
        Assert.Equal(200, progress.TotalXp);
        Assert.Equal(1, progress.CurrentLevel);
        Assert.Equal(0, progress.CurrentLevelMinimumXp);
        Assert.Equal(2, progress.NextLevel);
        Assert.Equal(500, progress.NextLevelMinimumXp);
        Assert.Equal(200, progress.XpIntoCurrentLevel);
        Assert.Equal(500, progress.XpRequiredForNextLevel);
        Assert.Equal(40m, progress.ProgressPercent);
    }

    [Fact]
    public async Task GetMyProgress_WithoutToken_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();
        await ResetProgressDataAsync();

        var response = await client.GetAsync("/api/progress/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetMyProgress_CalculatesXpFromCompletedTrailDistancesAndDifficulty()
    {
        var client = _factory.CreateClient();
        await ResetProgressDataAsync();
        var user = await SeedUserAsync("xp.integration.user@example.com", UserRole.User);
        var easyTrail = await SeedTrailAsync("xp-easy-trail", "XP Easy Trail", 5m, TrailDifficulty.Easy);
        var moderateTrail = await SeedTrailAsync("xp-moderate-trail", "XP Moderate Trail", 10m, TrailDifficulty.Moderate);
        var hardTrail = await SeedTrailAsync("xp-hard-trail", "XP Hard Trail", 12m, TrailDifficulty.Hard);
        await SeedCheckInAsync(user.Id, easyTrail.Id);
        await SeedCheckInAsync(user.Id, moderateTrail.Id);
        await SeedCheckInAsync(user.Id, hardTrail.Id);
        client.DefaultRequestHeaders.Authorization = CreateAuthorizationHeader(user);

        var response = await client.GetAsync("/api/progress/me");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var progress = await response.Content.ReadFromJsonAsync<UserProgressResponse>();
        Assert.NotNull(progress);
        Assert.Equal(350, progress.TotalXp);
    }

    [Fact]
    public async Task GetMyProgress_CalculatesLevelProgressFromTotalXp()
    {
        var client = _factory.CreateClient();
        await ResetProgressDataAsync();
        var user = await SeedUserAsync("level.integration.user@example.com", UserRole.User);
        var hardTrail = await SeedTrailAsync("level-hard-trail", "Level Hard Trail", 50m, TrailDifficulty.Hard);
        await SeedCheckInAsync(user.Id, hardTrail.Id);
        client.DefaultRequestHeaders.Authorization = CreateAuthorizationHeader(user);

        var response = await client.GetAsync("/api/progress/me");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var progress = await response.Content.ReadFromJsonAsync<UserProgressResponse>();
        Assert.NotNull(progress);
        Assert.Equal(750, progress.TotalXp);
        Assert.Equal(2, progress.CurrentLevel);
        Assert.Equal(500, progress.CurrentLevelMinimumXp);
        Assert.Equal(3, progress.NextLevel);
        Assert.Equal(1_000, progress.NextLevelMinimumXp);
        Assert.Equal(250, progress.XpIntoCurrentLevel);
        Assert.Equal(500, progress.XpRequiredForNextLevel);
        Assert.Equal(50m, progress.ProgressPercent);
    }

    private async Task ResetProgressDataAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        dbContext.CheckIns.RemoveRange(await dbContext.CheckIns.ToListAsync());
        dbContext.Trails.RemoveRange(await dbContext.Trails.ToListAsync());
        dbContext.Users.RemoveRange(await dbContext.Users.ToListAsync());
        await dbContext.SaveChangesAsync();
    }

    private async Task<User> SeedUserAsync(string email, UserRole role)
    {
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var now = DateTime.UtcNow;
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            DisplayName = email.Split('@', 2)[0],
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123"),
            Role = role,
            Status = UserStatus.Active,
            AuthProvider = AuthProvider.Local,
            CreatedAt = now,
            UpdatedAt = now
        };

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();

        return user;
    }

    private async Task<Trail> SeedTrailAsync(
        string docId,
        string name,
        decimal distanceKm,
        TrailDifficulty difficulty)
    {
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var now = DateTime.UtcNow;
        var trail = new Trail
        {
            Id = Guid.NewGuid(),
            DocId = docId,
            Name = name,
            City = "Christchurch",
            Region = "Canterbury",
            Difficulty = difficulty,
            DistanceKm = distanceKm,
            Description = $"{name} integration test trail",
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };

        dbContext.Trails.Add(trail);
        await dbContext.SaveChangesAsync();

        return trail;
    }

    private async Task<CheckIn> SeedCheckInAsync(
        Guid userId,
        Guid trailId,
        bool isHidden = false)
    {
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var checkIn = new CheckIn
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TrailId = trailId,
            CompletedDate = new DateTime(2026, 1, 10, 10, 0, 0, DateTimeKind.Utc),
            Notes = "Recorded test check-in",
            IsHidden = isHidden
        };

        dbContext.CheckIns.Add(checkIn);
        await dbContext.SaveChangesAsync();

        return checkIn;
    }

    private AuthenticationHeaderValue CreateAuthorizationHeader(User user)
    {
        using var scope = _factory.Services.CreateScope();
        var tokenGenerator = scope.ServiceProvider.GetRequiredService<IJwtTokenGenerator>();
        var token = tokenGenerator.GenerateAccessToken(
            user.Id,
            user.Email,
            user.Role.ToString());

        return new AuthenticationHeaderValue("Bearer", token);
    }
}
