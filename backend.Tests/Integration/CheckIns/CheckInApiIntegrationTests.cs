using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using backend.Authentication;
using backend.Data;
using backend.DTOs.CheckIn;
using backend.Entities;
using backend.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace backend.Tests.Integration.CheckIns;

public class CheckInApiIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public CheckInApiIntegrationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task CreateCheckIn_WithAuthenticatedUser_CreatesCheckIn()
    {
        var client = _factory.CreateClient();
        await ResetCheckInDataAsync();
        var user = await SeedUserAsync("create.checkin.user@example.com", UserRole.User);
        var trail = await SeedTrailAsync("create-checkin-trail", "Create Check-In Trail");
        client.DefaultRequestHeaders.Authorization = CreateAuthorizationHeader(user);
        var completedDate = new DateTime(2026, 1, 10, 10, 0, 0, DateTimeKind.Utc);

        var response = await client.PostAsJsonAsync("/api/checkins", new CreateCheckInRequest
        {
            TrailId = trail.Id,
            CompletedDate = completedDate,
            Notes = "  Finished before lunch.  ",
            PhotoUrl = "  https://example.com/checkin.jpg  "
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var checkInResponse = await response.Content.ReadFromJsonAsync<CheckInResponse>();
        Assert.NotNull(checkInResponse);
        Assert.Equal(user.Id, checkInResponse.UserId);
        Assert.Equal(trail.Id, checkInResponse.TrailId);
        Assert.Equal("Finished before lunch.", checkInResponse.Notes);
        Assert.Equal("https://example.com/checkin.jpg", checkInResponse.PhotoUrl);
        Assert.False(checkInResponse.IsHidden);

        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var savedCheckIn = await dbContext.CheckIns.SingleAsync();
        Assert.Equal(checkInResponse.Id, savedCheckIn.Id);
        Assert.Equal("Finished before lunch.", savedCheckIn.Notes);
    }

    [Fact]
    public async Task CreateCheckIn_WithoutToken_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();
        await ResetCheckInDataAsync();
        var trail = await SeedTrailAsync("unauthorized-checkin-trail", "Unauthorized Check-In Trail");

        var response = await client.PostAsJsonAsync("/api/checkins", new CreateCheckInRequest
        {
            TrailId = trail.Id,
            CompletedDate = new DateTime(2026, 1, 10, 10, 0, 0, DateTimeKind.Utc)
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CreateCheckIn_WithInvalidRequest_ReturnsValidationErrors()
    {
        var client = _factory.CreateClient();
        await ResetCheckInDataAsync();
        var user = await SeedUserAsync("invalid.checkin.user@example.com", UserRole.User);
        client.DefaultRequestHeaders.Authorization = CreateAuthorizationHeader(user);

        var response = await client.PostAsJsonAsync("/api/checkins", new CreateCheckInRequest
        {
            TrailId = Guid.Empty,
            CompletedDate = DateTime.UtcNow.AddDays(1)
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("Validation failed", body);
        Assert.Contains("Trail id is required", body);
        Assert.Contains("Completed date cannot be in the future", body);
    }

    [Fact]
    public async Task UpdateCheckIn_WithOwner_UpdatesCheckIn()
    {
        var client = _factory.CreateClient();
        await ResetCheckInDataAsync();
        var user = await SeedUserAsync("update.checkin.user@example.com", UserRole.User);
        var trail = await SeedTrailAsync("update-checkin-trail", "Update Check-In Trail");
        var checkIn = await SeedCheckInAsync(user.Id, trail.Id, notes: "Original notes");
        client.DefaultRequestHeaders.Authorization = CreateAuthorizationHeader(user);
        var completedDate = new DateTime(2026, 1, 12, 11, 0, 0, DateTimeKind.Utc);

        var response = await client.PutAsJsonAsync($"/api/checkins/{checkIn.Id}", new UpdateCheckInRequest
        {
            CompletedDate = completedDate,
            Notes = "  Updated notes  ",
            PhotoUrl = "  https://example.com/updated.jpg  "
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var checkInResponse = await response.Content.ReadFromJsonAsync<CheckInResponse>();
        Assert.NotNull(checkInResponse);
        Assert.Equal(checkIn.Id, checkInResponse.Id);
        Assert.Equal("Updated notes", checkInResponse.Notes);
        Assert.Equal("https://example.com/updated.jpg", checkInResponse.PhotoUrl);

        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var savedCheckIn = await dbContext.CheckIns.FindAsync(checkIn.Id);
        Assert.NotNull(savedCheckIn);
        Assert.Equal("Updated notes", savedCheckIn.Notes);
    }

    [Fact]
    public async Task UpdateCheckIn_WithNonOwner_ReturnsForbidden()
    {
        var client = _factory.CreateClient();
        await ResetCheckInDataAsync();
        var owner = await SeedUserAsync("owner.update.checkin@example.com", UserRole.User);
        var otherUser = await SeedUserAsync("other.update.checkin@example.com", UserRole.User);
        var trail = await SeedTrailAsync("forbidden-update-checkin-trail", "Forbidden Update Check-In Trail");
        var checkIn = await SeedCheckInAsync(owner.Id, trail.Id, notes: "Owner notes");
        client.DefaultRequestHeaders.Authorization = CreateAuthorizationHeader(otherUser);

        var response = await client.PutAsJsonAsync($"/api/checkins/{checkIn.Id}", new UpdateCheckInRequest
        {
            CompletedDate = new DateTime(2026, 1, 12, 11, 0, 0, DateTimeKind.Utc),
            Notes = "Changed by someone else"
        });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task DeleteCheckIn_WithOwner_RemovesCheckIn()
    {
        var client = _factory.CreateClient();
        await ResetCheckInDataAsync();
        var user = await SeedUserAsync("delete.checkin.user@example.com", UserRole.User);
        var trail = await SeedTrailAsync("delete-checkin-trail", "Delete Check-In Trail");
        var checkIn = await SeedCheckInAsync(user.Id, trail.Id);
        client.DefaultRequestHeaders.Authorization = CreateAuthorizationHeader(user);

        var response = await client.DeleteAsync($"/api/checkins/{checkIn.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        Assert.False(await dbContext.CheckIns.AnyAsync(existing => existing.Id == checkIn.Id));
    }

    [Fact]
    public async Task DeleteCheckIn_WithNonOwner_ReturnsForbidden()
    {
        var client = _factory.CreateClient();
        await ResetCheckInDataAsync();
        var owner = await SeedUserAsync("owner.delete.checkin@example.com", UserRole.User);
        var otherUser = await SeedUserAsync("other.delete.checkin@example.com", UserRole.User);
        var trail = await SeedTrailAsync("forbidden-delete-checkin-trail", "Forbidden Delete Check-In Trail");
        var checkIn = await SeedCheckInAsync(owner.Id, trail.Id);
        client.DefaultRequestHeaders.Authorization = CreateAuthorizationHeader(otherUser);

        var response = await client.DeleteAsync($"/api/checkins/{checkIn.Id}");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task GetMyCheckInHistory_ReturnsOnlyVisibleCurrentUserCheckIns()
    {
        var client = _factory.CreateClient();
        await ResetCheckInDataAsync();
        var user = await SeedUserAsync("history.checkin.user@example.com", UserRole.User);
        var otherUser = await SeedUserAsync("other.history.checkin@example.com", UserRole.User);
        var trail = await SeedTrailAsync("history-checkin-trail", "History Check-In Trail");
        var older = await SeedCheckInAsync(
            user.Id,
            trail.Id,
            new DateTime(2026, 1, 10, 10, 0, 0, DateTimeKind.Utc),
            notes: "Older visible");
        var newer = await SeedCheckInAsync(
            user.Id,
            trail.Id,
            new DateTime(2026, 1, 11, 10, 0, 0, DateTimeKind.Utc),
            notes: "Newer visible");
        await SeedCheckInAsync(
            user.Id,
            trail.Id,
            new DateTime(2026, 1, 12, 10, 0, 0, DateTimeKind.Utc),
            notes: "Hidden current user",
            isHidden: true);
        await SeedCheckInAsync(
            otherUser.Id,
            trail.Id,
            new DateTime(2026, 1, 13, 10, 0, 0, DateTimeKind.Utc),
            notes: "Other user visible");
        client.DefaultRequestHeaders.Authorization = CreateAuthorizationHeader(user);

        var response = await client.GetAsync("/api/checkins/me");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var checkIns = await response.Content.ReadFromJsonAsync<List<CheckInResponse>>();
        Assert.NotNull(checkIns);
        Assert.Equal([newer.Id, older.Id], checkIns.Select(checkIn => checkIn.Id));
    }

    [Fact]
    public async Task GetAllCheckIns_WithModeratorRole_ReturnsVisibleAndHiddenCheckIns()
    {
        var client = _factory.CreateClient();
        await ResetCheckInDataAsync();
        var moderator = await SeedUserAsync("moderator.checkin@example.com", UserRole.Moderator);
        var user = await SeedUserAsync("all.checkin.user@example.com", UserRole.User);
        var trail = await SeedTrailAsync("all-checkins-trail", "All Check-Ins Trail");
        var visible = await SeedCheckInAsync(
            user.Id,
            trail.Id,
            new DateTime(2026, 1, 10, 10, 0, 0, DateTimeKind.Utc),
            notes: "Visible check-in");
        var hidden = await SeedCheckInAsync(
            user.Id,
            trail.Id,
            new DateTime(2026, 1, 11, 10, 0, 0, DateTimeKind.Utc),
            notes: "Hidden check-in",
            isHidden: true);
        client.DefaultRequestHeaders.Authorization = CreateAuthorizationHeader(moderator);

        var response = await client.GetAsync("/api/checkins");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var checkIns = await response.Content.ReadFromJsonAsync<List<CheckInResponse>>();
        Assert.NotNull(checkIns);
        Assert.Equal([hidden.Id, visible.Id], checkIns.Select(checkIn => checkIn.Id));
        Assert.Contains(checkIns, checkIn => checkIn.Id == hidden.Id && checkIn.IsHidden);
    }

    [Fact]
    public async Task GetAllCheckIns_WithUserRole_ReturnsForbidden()
    {
        var client = _factory.CreateClient();
        await ResetCheckInDataAsync();
        var user = await SeedUserAsync("forbidden.all.checkins.user@example.com", UserRole.User);
        client.DefaultRequestHeaders.Authorization = CreateAuthorizationHeader(user);

        var response = await client.GetAsync("/api/checkins");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task HideCheckIn_WithModeratorRole_HidesCheckIn()
    {
        var client = _factory.CreateClient();
        await ResetCheckInDataAsync();
        var moderator = await SeedUserAsync("hide.moderator@example.com", UserRole.Moderator);
        var user = await SeedUserAsync("hide.checkin.user@example.com", UserRole.User);
        var trail = await SeedTrailAsync("hide-checkin-trail", "Hide Check-In Trail");
        var checkIn = await SeedCheckInAsync(user.Id, trail.Id, notes: "Needs moderation");
        client.DefaultRequestHeaders.Authorization = CreateAuthorizationHeader(moderator);

        var response = await client.PutAsync($"/api/checkins/{checkIn.Id}/hide", null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var checkInResponse = await response.Content.ReadFromJsonAsync<CheckInResponse>();
        Assert.NotNull(checkInResponse);
        Assert.True(checkInResponse.IsHidden);

        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var savedCheckIn = await dbContext.CheckIns.FindAsync(checkIn.Id);
        Assert.NotNull(savedCheckIn);
        Assert.True(savedCheckIn.IsHidden);
    }

    [Fact]
    public async Task HideCheckIn_WithUserRole_ReturnsForbidden()
    {
        var client = _factory.CreateClient();
        await ResetCheckInDataAsync();
        var user = await SeedUserAsync("hide.forbidden.user@example.com", UserRole.User);
        var trail = await SeedTrailAsync("hide-forbidden-checkin-trail", "Hide Forbidden Check-In Trail");
        var checkIn = await SeedCheckInAsync(user.Id, trail.Id);
        client.DefaultRequestHeaders.Authorization = CreateAuthorizationHeader(user);

        var response = await client.PutAsync($"/api/checkins/{checkIn.Id}/hide", null);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task RestoreCheckIn_WithAdminRole_RestoresCheckIn()
    {
        var client = _factory.CreateClient();
        await ResetCheckInDataAsync();
        var admin = await SeedUserAsync("restore.admin@example.com", UserRole.Admin);
        var user = await SeedUserAsync("restore.checkin.user@example.com", UserRole.User);
        var trail = await SeedTrailAsync("restore-checkin-trail", "Restore Check-In Trail");
        var checkIn = await SeedCheckInAsync(user.Id, trail.Id, notes: "Hidden earlier", isHidden: true);
        client.DefaultRequestHeaders.Authorization = CreateAuthorizationHeader(admin);

        var response = await client.PutAsync($"/api/checkins/{checkIn.Id}/restore", null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var checkInResponse = await response.Content.ReadFromJsonAsync<CheckInResponse>();
        Assert.NotNull(checkInResponse);
        Assert.False(checkInResponse.IsHidden);

        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var savedCheckIn = await dbContext.CheckIns.FindAsync(checkIn.Id);
        Assert.NotNull(savedCheckIn);
        Assert.False(savedCheckIn.IsHidden);
    }

    [Fact]
    public async Task RestoreCheckIn_WithUserRole_ReturnsForbidden()
    {
        var client = _factory.CreateClient();
        await ResetCheckInDataAsync();
        var user = await SeedUserAsync("restore.forbidden.user@example.com", UserRole.User);
        var trail = await SeedTrailAsync("restore-forbidden-checkin-trail", "Restore Forbidden Check-In Trail");
        var checkIn = await SeedCheckInAsync(user.Id, trail.Id, isHidden: true);
        client.DefaultRequestHeaders.Authorization = CreateAuthorizationHeader(user);

        var response = await client.PutAsync($"/api/checkins/{checkIn.Id}/restore", null);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    private async Task ResetCheckInDataAsync()
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

    private async Task<Trail> SeedTrailAsync(string docId, string name)
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
            Difficulty = TrailDifficulty.Moderate,
            DistanceKm = 7.5m,
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
        DateTime? completedDate = null,
        string? notes = "Recorded test check-in",
        bool isHidden = false)
    {
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var checkIn = new CheckIn
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TrailId = trailId,
            CompletedDate = completedDate ?? new DateTime(2026, 1, 10, 10, 0, 0, DateTimeKind.Utc),
            Notes = notes,
            PhotoUrl = "https://example.com/checkin.jpg",
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
