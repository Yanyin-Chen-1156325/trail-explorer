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

public class GetUsersIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public GetUsersIntegrationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetUsers_WithoutToken_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/users");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetUsers_WithUserRole_ReturnsForbidden()
    {
        var client = _factory.CreateClient();
        var user = await SeedUserAsync("regular.user@example.com", UserRole.User);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            CreateAccessToken(user));

        var response = await client.GetAsync("/api/users");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task GetUsers_WithAdminRole_ReturnsUsers()
    {
        var client = _factory.CreateClient();
        var admin = await SeedUserAsync("admin.user@example.com", UserRole.Admin);
        var regularUser = await SeedUserAsync("listed.user@example.com", UserRole.User);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            CreateAccessToken(admin));

        var response = await client.GetAsync("/api/users");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var users = await response.Content.ReadFromJsonAsync<List<UserResponse>>();
        Assert.NotNull(users);
        Assert.Contains(users, user => user.Email == admin.Email && user.Role == UserRole.Admin);
        Assert.Contains(users, user => user.Email == regularUser.Email && user.Role == UserRole.User);
    }

    [Fact]
    public async Task GetUsers_WithModeratorRole_ReturnsUsers()
    {
        var client = _factory.CreateClient();
        var moderator = await SeedUserAsync("moderator.user@example.com", UserRole.Moderator);
        var regularUser = await SeedUserAsync("moderator-listed.user@example.com", UserRole.User);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            CreateAccessToken(moderator));

        var response = await client.GetAsync("/api/users");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var users = await response.Content.ReadFromJsonAsync<List<UserResponse>>();
        Assert.NotNull(users);
        Assert.Contains(users, user => user.Email == moderator.Email && user.Role == UserRole.Moderator);
        Assert.Contains(users, user => user.Email == regularUser.Email && user.Role == UserRole.User);
    }

    [Fact]
    public async Task GetUsers_WithAdminRole_DoesNotReturnSensitiveFields()
    {
        var client = _factory.CreateClient();
        var admin = await SeedUserAsync("safe.admin@example.com", UserRole.Admin);
        await SeedUserAsync("safe.user@example.com", UserRole.User);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            CreateAccessToken(admin));

        var response = await client.GetAsync("/api/users");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadAsStringAsync();
        Assert.DoesNotContain("passwordHash", body, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("Password123", body, StringComparison.OrdinalIgnoreCase);
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
