using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using backend.Authentication;
using backend.Data;
using backend.DTOs.User;
using backend.Entities;
using backend.Enums;
using Microsoft.Extensions.DependencyInjection;

namespace backend.Tests.Integration.Users;

public class UpdateUserStatusIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public UpdateUserStatusIntegrationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task UpdateUserStatus_WithoutToken_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();
        var targetUser = await SeedUserAsync("status.unauthorized.target@example.com", UserRole.User);

        var response = await client.PutAsJsonAsync($"/api/users/{targetUser.Id}/status", new UpdateUserStatusRequest
        {
            Status = UserStatus.Suspended
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task UpdateUserStatus_WithUserRole_ReturnsForbidden()
    {
        var client = _factory.CreateClient();
        var actor = await SeedUserAsync("status.forbidden.actor@example.com", UserRole.User);
        var targetUser = await SeedUserAsync("status.forbidden.target@example.com", UserRole.User);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            CreateAccessToken(actor));

        var response = await client.PutAsJsonAsync($"/api/users/{targetUser.Id}/status", new UpdateUserStatusRequest
        {
            Status = UserStatus.Suspended
        });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task UpdateUserStatus_WithModeratorRole_SuspendsUser()
    {
        var client = _factory.CreateClient();
        var actor = await SeedUserAsync("status.moderator.actor@example.com", UserRole.Moderator);
        var targetUser = await SeedUserAsync("status.moderator.target@example.com", UserRole.User);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            CreateAccessToken(actor));

        var response = await client.PutAsJsonAsync($"/api/users/{targetUser.Id}/status", new UpdateUserStatusRequest
        {
            Status = UserStatus.Suspended
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var userResponse = await response.Content.ReadFromJsonAsync<UserResponse>();
        Assert.NotNull(userResponse);
        Assert.Equal(targetUser.Id, userResponse.Id);
        Assert.Equal(UserStatus.Suspended, userResponse.Status);
    }

    [Fact]
    public async Task UpdateUserStatus_WithModeratorRoleChangingToActive_ReturnsForbidden()
    {
        var client = _factory.CreateClient();
        var actor = await SeedUserAsync("status.moderator.active.actor@example.com", UserRole.Moderator);
        var targetUser = await SeedUserAsync("status.moderator.active.target@example.com", UserRole.User);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            CreateAccessToken(actor));

        var response = await client.PutAsJsonAsync($"/api/users/{targetUser.Id}/status", new UpdateUserStatusRequest
        {
            Status = UserStatus.Active
        });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task UpdateUserStatus_WithModeratorRoleChangingAdmin_ReturnsForbidden()
    {
        var client = _factory.CreateClient();
        var actor = await SeedUserAsync("status.moderator.admin.actor@example.com", UserRole.Moderator);
        var targetUser = await SeedUserAsync("status.moderator.admin.target@example.com", UserRole.Admin);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            CreateAccessToken(actor));

        var response = await client.PutAsJsonAsync($"/api/users/{targetUser.Id}/status", new UpdateUserStatusRequest
        {
            Status = UserStatus.Suspended
        });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task UpdateUserStatus_WithAdminRole_UpdatesStatus()
    {
        var client = _factory.CreateClient();
        var admin = await SeedUserAsync("status.admin@example.com", UserRole.Admin);
        var targetUser = await SeedUserAsync("status.target@example.com", UserRole.User);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            CreateAccessToken(admin));

        var response = await client.PutAsJsonAsync($"/api/users/{targetUser.Id}/status", new UpdateUserStatusRequest
        {
            Status = UserStatus.Suspended
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var userResponse = await response.Content.ReadFromJsonAsync<UserResponse>();
        Assert.NotNull(userResponse);
        Assert.Equal(targetUser.Id, userResponse.Id);
        Assert.Equal(UserStatus.Suspended, userResponse.Status);

        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var updatedUser = await dbContext.Users.FindAsync(targetUser.Id);

        Assert.NotNull(updatedUser);
        Assert.Equal(UserStatus.Suspended, updatedUser.Status);
    }

    [Fact]
    public async Task UpdateUserStatus_WhenAdminTargetsSelf_ReturnsBadRequest()
    {
        var client = _factory.CreateClient();
        var admin = await SeedUserAsync("status.self.admin@example.com", UserRole.Admin);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            CreateAccessToken(admin));

        var response = await client.PutAsJsonAsync($"/api/users/{admin.Id}/status", new UpdateUserStatusRequest
        {
            Status = UserStatus.Suspended
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("You cannot change your own status", body);
    }

    [Fact]
    public async Task UpdateUserStatus_WhenUserDoesNotExist_ReturnsNotFound()
    {
        var client = _factory.CreateClient();
        var admin = await SeedUserAsync("status.notfound.admin@example.com", UserRole.Admin);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            CreateAccessToken(admin));

        var response = await client.PutAsJsonAsync($"/api/users/{Guid.NewGuid()}/status", new UpdateUserStatusRequest
        {
            Status = UserStatus.Suspended
        });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UpdateUserStatus_WithInvalidStatus_ReturnsValidationErrors()
    {
        var client = _factory.CreateClient();
        var admin = await SeedUserAsync("status.invalid.admin@example.com", UserRole.Admin);
        var targetUser = await SeedUserAsync("status.invalid.target@example.com", UserRole.User);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            CreateAccessToken(admin));

        var response = await client.PutAsJsonAsync($"/api/users/{targetUser.Id}/status", new UpdateUserStatusRequest
        {
            Status = (UserStatus)999
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("Validation failed", body);
        Assert.Contains("Status must be a valid user status", body);
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

    private string CreateAccessToken(User user)
    {
        using var scope = _factory.Services.CreateScope();
        var tokenGenerator = scope.ServiceProvider.GetRequiredService<IJwtTokenGenerator>();

        return tokenGenerator.GenerateAccessToken(
            user.Id,
            user.Email,
            user.Role.ToString());
    }
}
