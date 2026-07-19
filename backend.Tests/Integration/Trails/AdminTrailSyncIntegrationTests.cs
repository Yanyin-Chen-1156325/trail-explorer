using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using backend.Authentication;
using backend.DTOs.Trail;
using backend.Entities;
using backend.Enums;
using backend.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace backend.Tests.Integration.Trails;

public class AdminTrailSyncIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public AdminTrailSyncIntegrationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task SyncDocTrails_WithAdminRole_ReturnsSyncResult()
    {
        var syncService = new FakeTrailSyncService(new TrailSyncResult
        {
            Succeeded = true,
            CandidatesFound = 4,
            Created = 2,
            Updated = 1,
            Skipped = 1
        });
        using var factory = CreateFactory(syncService);
        var client = factory.CreateClient();
        var admin = await SeedUserAsync(factory, "sync.admin@example.com", UserRole.Admin);
        client.DefaultRequestHeaders.Authorization = CreateAuthorizationHeader(factory, admin);

        var response = await client.PostAsync("/api/admin/trails/sync", null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<TrailSyncResult>();
        Assert.NotNull(result);
        Assert.True(result.Succeeded);
        Assert.Equal(4, result.CandidatesFound);
        Assert.Equal(2, result.Created);
        Assert.Equal(1, syncService.CallCount);
    }

    [Fact]
    public async Task SyncDocTrails_WithModeratorRole_ReturnsForbidden()
    {
        using var factory = CreateFactory(new FakeTrailSyncService());
        var client = factory.CreateClient();
        var moderator = await SeedUserAsync(
            factory,
            "sync.moderator@example.com",
            UserRole.Moderator);
        client.DefaultRequestHeaders.Authorization =
            CreateAuthorizationHeader(factory, moderator);

        var response = await client.PostAsync("/api/admin/trails/sync", null);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task SyncDocTrails_WithoutToken_ReturnsUnauthorized()
    {
        using var factory = CreateFactory(new FakeTrailSyncService());
        var client = factory.CreateClient();

        var response = await client.PostAsync("/api/admin/trails/sync", null);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private WebApplicationFactory<Program> CreateFactory(FakeTrailSyncService syncService)
    {
        return _factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                services.RemoveAll<ITrailSyncService>();
                services.AddSingleton<ITrailSyncService>(syncService);
            });
        });
    }

    private static async Task<User> SeedUserAsync(
        WebApplicationFactory<Program> factory,
        string email,
        UserRole role)
    {
        using var scope = factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<backend.Data.ApplicationDbContext>();
        var now = DateTime.UtcNow;
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            DisplayName = email.Split('@')[0],
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

    private static AuthenticationHeaderValue CreateAuthorizationHeader(
        WebApplicationFactory<Program> factory,
        User user)
    {
        using var scope = factory.Services.CreateScope();
        var tokenGenerator = scope.ServiceProvider.GetRequiredService<IJwtTokenGenerator>();
        var token = tokenGenerator.GenerateAccessToken(
            user.Id,
            user.Email,
            user.Role.ToString());

        return new AuthenticationHeaderValue("Bearer", token);
    }

    private sealed class FakeTrailSyncService : ITrailSyncService
    {
        private readonly TrailSyncResult _result;

        public FakeTrailSyncService(TrailSyncResult? result = null)
        {
            _result = result ?? new TrailSyncResult
            {
                Succeeded = true
            };
        }

        public int CallCount { get; private set; }

        public Task<TrailSyncResult> SyncFromDocAsync(
            CancellationToken cancellationToken = default)
        {
            CallCount++;

            return Task.FromResult(_result);
        }
    }
}
