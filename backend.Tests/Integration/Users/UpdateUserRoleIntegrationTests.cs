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

public class UpdateUserRoleIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public UpdateUserRoleIntegrationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task UpdateUserRole_WithoutToken_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();
        var targetUser = await SeedUserAsync("unauthorized.target@example.com", UserRole.User);

        var response = await client.PutAsJsonAsync($"/api/users/{targetUser.Id}/role", new UpdateUserRoleRequest
        {
            Role = UserRole.Moderator
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task UpdateUserRole_WithUserRole_ReturnsForbidden()
    {
        var client = _factory.CreateClient();
        var actor = await SeedUserAsync("forbidden.actor@example.com", UserRole.User);
        var targetUser = await SeedUserAsync("forbidden.target@example.com", UserRole.User);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            CreateAccessToken(actor));

        var response = await client.PutAsJsonAsync($"/api/users/{targetUser.Id}/role", new UpdateUserRoleRequest
        {
            Role = UserRole.Moderator
        });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task UpdateUserRole_WithAdminRole_UpdatesRole()
    {
        var client = _factory.CreateClient();
        var admin = await SeedUserAsync("role.admin@example.com", UserRole.Admin);
        var targetUser = await SeedUserAsync("role.target@example.com", UserRole.User);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            CreateAccessToken(admin));

        var response = await client.PutAsJsonAsync($"/api/users/{targetUser.Id}/role", new UpdateUserRoleRequest
        {
            Role = UserRole.Moderator
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var userResponse = await response.Content.ReadFromJsonAsync<UserResponse>();
        Assert.NotNull(userResponse);
        Assert.Equal(targetUser.Id, userResponse.Id);
        Assert.Equal(UserRole.Moderator, userResponse.Role);

        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var updatedUser = await dbContext.Users.FindAsync(targetUser.Id);

        Assert.NotNull(updatedUser);
        Assert.Equal(UserRole.Moderator, updatedUser.Role);
    }

    [Fact]
    public async Task UpdateUserRole_WhenUserDoesNotExist_ReturnsNotFound()
    {
        var client = _factory.CreateClient();
        var admin = await SeedUserAsync("notfound.admin@example.com", UserRole.Admin);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            CreateAccessToken(admin));

        var response = await client.PutAsJsonAsync($"/api/users/{Guid.NewGuid()}/role", new UpdateUserRoleRequest
        {
            Role = UserRole.Moderator
        });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("User not found", body);
    }

    [Fact]
    public async Task UpdateUserRole_WithInvalidRole_ReturnsValidationErrors()
    {
        var client = _factory.CreateClient();
        var admin = await SeedUserAsync("invalid-role.admin@example.com", UserRole.Admin);
        var targetUser = await SeedUserAsync("invalid-role.target@example.com", UserRole.User);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            CreateAccessToken(admin));

        var response = await client.PutAsJsonAsync($"/api/users/{targetUser.Id}/role", new UpdateUserRoleRequest
        {
            Role = (UserRole)999
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("Validation failed", body);
        Assert.Contains("Role must be a valid user role", body);
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
