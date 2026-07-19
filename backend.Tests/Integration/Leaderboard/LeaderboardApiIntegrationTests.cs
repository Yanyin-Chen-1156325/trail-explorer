using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using backend.Authentication;
using backend.Data;
using backend.DTOs.Leaderboard;
using backend.Entities;
using backend.Enums;
using backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace backend.Tests.Integration.Leaderboard;

public class LeaderboardApiIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public LeaderboardApiIntegrationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetLeaderboard_WithAuthenticatedUser_ReturnsRankedEntries()
    {
        var client = _factory.CreateClient();
        await ResetLeaderboardDataAsync();
        var topUser = await SeedUserAsync("leaderboard.top@example.com", "Top Hiker");
        var currentUser = await SeedUserAsync("leaderboard.current@example.com", "Current Hiker");
        var trail = await SeedTrailAsync("leaderboard-trail", "Leaderboard Trail", 10m, TrailDifficulty.Hard);
        await SeedCheckInAsync(topUser.Id, trail.Id);
        await SeedCheckInAsync(currentUser.Id, trail.Id, isHidden: true);
        client.DefaultRequestHeaders.Authorization = CreateAuthorizationHeader(currentUser);

        var response = await client.GetAsync("/api/leaderboard?limit=1");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var leaderboard = await response.Content.ReadFromJsonAsync<List<LeaderboardEntryResponse>>();
        Assert.NotNull(leaderboard);
        Assert.Single(leaderboard);
        Assert.Equal(1, leaderboard[0].Rank);
        Assert.Equal(topUser.Id, leaderboard[0].UserId);
        Assert.Equal("Top Hiker", leaderboard[0].DisplayName);
        Assert.Equal(150, leaderboard[0].TotalXp);
    }

    [Fact]
    public async Task GetLeaderboard_ExcludesAdminAndModeratorUsers()
    {
        var client = _factory.CreateClient();
        await ResetLeaderboardDataAsync();
        var currentUser = await SeedUserAsync("leaderboard.user@example.com", "User Hiker");
        var admin = await SeedUserAsync("leaderboard.admin@example.com", "Admin Hiker", UserRole.Admin);
        var moderator = await SeedUserAsync("leaderboard.moderator@example.com", "Moderator Hiker", UserRole.Moderator);
        var trail = await SeedTrailAsync("leaderboard-role-trail", "Leaderboard Role Trail", 10m, TrailDifficulty.Hard);
        await SeedCheckInAsync(currentUser.Id, trail.Id);
        await SeedCheckInAsync(admin.Id, trail.Id);
        await SeedCheckInAsync(moderator.Id, trail.Id);
        client.DefaultRequestHeaders.Authorization = CreateAuthorizationHeader(currentUser);

        var response = await client.GetAsync("/api/leaderboard");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var leaderboard = await response.Content.ReadFromJsonAsync<List<LeaderboardEntryResponse>>();
        Assert.NotNull(leaderboard);
        Assert.Single(leaderboard);
        Assert.Equal(currentUser.Id, leaderboard[0].UserId);
    }

    [Fact]
    public async Task GetLeaderboard_WithoutToken_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();
        await ResetLeaderboardDataAsync();

        var response = await client.GetAsync("/api/leaderboard");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task LeaderboardHubNegotiate_WithAuthenticatedUser_ReturnsOk()
    {
        var client = _factory.CreateClient();
        await ResetLeaderboardDataAsync();
        var user = await SeedUserAsync("leaderboard.hub@example.com", "Hub User");
        client.DefaultRequestHeaders.Authorization = CreateAuthorizationHeader(user);

        var response = await client.PostAsync(
            "/hubs/leaderboard/negotiate?negotiateVersion=1",
            null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task LeaderboardHubNegotiate_WithoutToken_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();
        await ResetLeaderboardDataAsync();

        var response = await client.PostAsync(
            "/hubs/leaderboard/negotiate?negotiateVersion=1",
            null);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private async Task ResetLeaderboardDataAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        dbContext.UserBadges.RemoveRange(await dbContext.UserBadges.ToListAsync());
        dbContext.Badges.RemoveRange(await dbContext.Badges.ToListAsync());
        dbContext.CheckIns.RemoveRange(await dbContext.CheckIns.ToListAsync());
        dbContext.Trails.RemoveRange(await dbContext.Trails.ToListAsync());
        dbContext.Users.RemoveRange(await dbContext.Users.ToListAsync());
        await dbContext.SaveChangesAsync();

        var leaderboardService = scope.ServiceProvider.GetRequiredService<ILeaderboardService>();
        leaderboardService.InvalidateLeaderboardCache();
    }

    private async Task<User> SeedUserAsync(
        string email,
        string displayName,
        UserRole role = UserRole.User)
    {
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var now = DateTime.UtcNow;
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            DisplayName = displayName,
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
            CompletedDate = DateTime.UtcNow,
            Notes = "Recorded leaderboard check-in",
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
