using System.Net;
using System.Net.Http.Json;
using backend.Data;
using backend.DTOs.Auth;
using backend.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace backend.Tests.Integration.Auth;

public class RegisterIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public RegisterIntegrationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Register_WithValidRequest_ReturnsAuthResponseAndPersistsUser()
    {
        var client = _factory.CreateClient();
        var request = CreateValidRequest("valid.registration@example.com");

        var response = await client.PostAsJsonAsync("/api/auth/register", request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var authResponse = await response.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(authResponse);
        Assert.Equal(request.Email, authResponse.Email);
        Assert.Equal(request.DisplayName, authResponse.DisplayName);
        Assert.False(string.IsNullOrWhiteSpace(authResponse.AccessToken));
        Assert.False(string.IsNullOrWhiteSpace(authResponse.RefreshToken));

        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var user = await dbContext.Users
            .Include(x => x.RefreshTokens)
            .SingleAsync(x => x.Email == request.Email);

        Assert.Equal(request.DisplayName, user.DisplayName);
        Assert.Equal(UserRole.User, user.Role);
        Assert.Equal(UserStatus.Active, user.Status);
        Assert.Equal(AuthProvider.Local, user.AuthProvider);
        Assert.NotEqual(request.Password, user.PasswordHash);
        Assert.Single(user.RefreshTokens);
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_ReturnsBadRequest()
    {
        var client = _factory.CreateClient();
        var request = CreateValidRequest("duplicate.registration@example.com");

        var firstResponse = await client.PostAsJsonAsync("/api/auth/register", request);
        var duplicateResponse = await client.PostAsJsonAsync("/api/auth/register", request);

        Assert.Equal(HttpStatusCode.OK, firstResponse.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, duplicateResponse.StatusCode);

        var body = await duplicateResponse.Content.ReadAsStringAsync();
        Assert.Contains("Email already registered", body);
    }

    [Fact]
    public async Task Register_WithInvalidRequest_ReturnsValidationErrors()
    {
        var client = _factory.CreateClient();
        var request = new RegisterRequest
        {
            Email = "",
            Password = "weak",
            DisplayName = ""
        };

        var response = await client.PostAsJsonAsync("/api/auth/register", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("Validation failed", body);
        Assert.Contains("Email is required", body);
        Assert.Contains("Password must be at least 8 characters", body);
        Assert.Contains("Display name is required", body);
    }

    private static RegisterRequest CreateValidRequest(string email)
    {
        return new RegisterRequest
        {
            Email = email,
            Password = "Password123",
            DisplayName = "Trail User"
        };
    }
}
