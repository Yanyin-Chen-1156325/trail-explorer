using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using backend.Authentication;
using backend.Data;
using backend.DTOs.Dashboard;
using backend.Entities;
using backend.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace backend.Tests.Integration.Dashboard;

public class DashboardApiIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public DashboardApiIntegrationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetMyDashboard_WithAuthenticatedUser_ReturnsDashboard()
    {
        var client = _factory.CreateClient();
        await ResetDashboardDataAsync();
        var user = await SeedUserAsync("dashboard.api.user@example.com", UserRole.User);
        var otherUser = await SeedUserAsync("other.dashboard.api.user@example.com", UserRole.User);
        var trail = await SeedTrailAsync(
            "dashboard-api-trail",
            "Dashboard API Trail",
            "Canterbury",
            10m,
            TrailDifficulty.Moderate);
        var otherTrail = await SeedTrailAsync(
            "dashboard-api-other-trail",
            "Dashboard API Other Trail",
            "Port Hills",
            20m,
            TrailDifficulty.Hard);
        var badge = await SeedBadgeAsync("Dashboard Badge");
        await SeedCheckInAsync(user.Id, trail.Id);
        await SeedCheckInAsync(otherUser.Id, otherTrail.Id);
        await SeedUserBadgeAsync(user.Id, badge.Id);
        client.DefaultRequestHeaders.Authorization = CreateAuthorizationHeader(user);

        var response = await client.GetAsync("/api/dashboard/me");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var dashboard = await response.Content.ReadFromJsonAsync<DashboardResponse>();
        Assert.NotNull(dashboard);
        Assert.Equal(120, dashboard.Progress.TotalXp);
        Assert.Equal(1, dashboard.UserSummary.CompletedTrails);
        Assert.Equal(10m, dashboard.UserSummary.TotalDistanceKm);
        Assert.Equal(1, dashboard.UserSummary.UnlockedBadges);
        Assert.Equal(1, dashboard.TrailStatistics.RegionsExplored);
        Assert.Equal(10m, dashboard.DistanceStatistics.LongestTrailDistanceKm);
        Assert.Equal(2, dashboard.LeaderboardRank);
        Assert.Single(dashboard.RecentBadges);
        Assert.Single(dashboard.RecentCheckIns);
        Assert.Equal("Dashboard API Trail", dashboard.RecentCheckIns[0].TrailName);
    }

    [Fact]
    public async Task GetMyDashboard_WithoutToken_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();
        await ResetDashboardDataAsync();

        var response = await client.GetAsync("/api/dashboard/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private async Task ResetDashboardDataAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        dbContext.UserBadges.RemoveRange(await dbContext.UserBadges.ToListAsync());
        dbContext.Badges.RemoveRange(await dbContext.Badges.ToListAsync());
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
        string region,
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
            Region = region,
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

    private async Task<Badge> SeedBadgeAsync(string name)
    {
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var badge = new Badge
        {
            Id = Guid.NewGuid(),
            Name = name,
            Description = $"{name} description",
            IconUrl = "/badges/dashboard.svg",
            Type = BadgeType.Completion
        };

        dbContext.Badges.Add(badge);
        await dbContext.SaveChangesAsync();

        return badge;
    }

    private async Task<CheckIn> SeedCheckInAsync(Guid userId, Guid trailId)
    {
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var checkIn = new CheckIn
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TrailId = trailId,
            CompletedDate = DateTime.UtcNow,
            Notes = "Recorded test check-in",
            IsHidden = false
        };

        dbContext.CheckIns.Add(checkIn);
        await dbContext.SaveChangesAsync();

        return checkIn;
    }

    private async Task SeedUserBadgeAsync(Guid userId, Guid badgeId)
    {
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        dbContext.UserBadges.Add(new UserBadge
        {
            UserId = userId,
            BadgeId = badgeId,
            UnlockedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();
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
