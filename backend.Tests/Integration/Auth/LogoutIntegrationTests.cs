using System.Net;
using System.Net.Http.Json;
using backend.DTOs.Auth;

namespace backend.Tests.Integration.Auth;

public class LogoutIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public LogoutIntegrationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Logout_WithValidRefreshToken_ReturnsNoContent()
    {
        var client = _factory.CreateClient();
        var registeredUser = await RegisterUserAsync(client, "valid.logout@example.com");

        var response = await client.PostAsJsonAsync("/api/auth/logout", new RefreshTokenRequest
        {
            RefreshToken = registeredUser.RefreshToken
        });

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Logout_ThenRefreshWithSameToken_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();
        var registeredUser = await RegisterUserAsync(client, "revoked.logout@example.com");

        var logoutResponse = await client.PostAsJsonAsync("/api/auth/logout", new RefreshTokenRequest
        {
            RefreshToken = registeredUser.RefreshToken
        });
        var refreshResponse = await client.PostAsJsonAsync("/api/auth/refresh", new RefreshTokenRequest
        {
            RefreshToken = registeredUser.RefreshToken
        });

        Assert.Equal(HttpStatusCode.NoContent, logoutResponse.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, refreshResponse.StatusCode);

        var body = await refreshResponse.Content.ReadAsStringAsync();
        Assert.Contains("Refresh token revoked", body);
    }

    [Fact]
    public async Task Logout_WithInvalidRefreshToken_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/logout", new RefreshTokenRequest
        {
            RefreshToken = "invalid-refresh-token"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);

        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("Invalid refresh token", body);
    }

    [Fact]
    public async Task Logout_WithInvalidRequest_ReturnsValidationErrors()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/logout", new RefreshTokenRequest
        {
            RefreshToken = ""
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("Validation failed", body);
        Assert.Contains("Refresh token is required", body);
    }

    private static async Task<AuthResponse> RegisterUserAsync(HttpClient client, string email)
    {
        var response = await client.PostAsJsonAsync("/api/auth/register", new RegisterRequest
        {
            Email = email,
            Password = "Password123",
            DisplayName = "Logout User"
        });

        response.EnsureSuccessStatusCode();

        var authResponse = await response.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(authResponse);

        return authResponse;
    }
}
