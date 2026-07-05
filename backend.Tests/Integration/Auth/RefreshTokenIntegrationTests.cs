using System.Net;
using System.Net.Http.Json;
using backend.DTOs.Auth;

namespace backend.Tests.Integration.Auth;

public class RefreshTokenIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public RefreshTokenIntegrationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Refresh_WithValidRefreshToken_ReturnsNewAuthResponse()
    {
        var client = _factory.CreateClient();
        var registeredUser = await RegisterUserAsync(client, "valid.refresh@example.com");

        var response = await client.PostAsJsonAsync("/api/auth/refresh", new RefreshTokenRequest
        {
            RefreshToken = registeredUser.RefreshToken
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var authResponse = await response.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(authResponse);
        Assert.Equal(registeredUser.Email, authResponse.Email);
        Assert.Equal(registeredUser.DisplayName, authResponse.DisplayName);
        Assert.False(string.IsNullOrWhiteSpace(authResponse.AccessToken));
        Assert.False(string.IsNullOrWhiteSpace(authResponse.RefreshToken));
        Assert.NotEqual(registeredUser.RefreshToken, authResponse.RefreshToken);
    }

    [Fact]
    public async Task Refresh_ReusingOldRefreshToken_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();
        var registeredUser = await RegisterUserAsync(client, "reuse.refresh@example.com");

        var firstResponse = await client.PostAsJsonAsync("/api/auth/refresh", new RefreshTokenRequest
        {
            RefreshToken = registeredUser.RefreshToken
        });
        var reusedResponse = await client.PostAsJsonAsync("/api/auth/refresh", new RefreshTokenRequest
        {
            RefreshToken = registeredUser.RefreshToken
        });

        Assert.Equal(HttpStatusCode.OK, firstResponse.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, reusedResponse.StatusCode);

        var body = await reusedResponse.Content.ReadAsStringAsync();
        Assert.Contains("Refresh token revoked", body);
    }

    [Fact]
    public async Task Refresh_WithInvalidRefreshToken_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/refresh", new RefreshTokenRequest
        {
            RefreshToken = "invalid-refresh-token"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);

        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("Invalid refresh token", body);
    }

    [Fact]
    public async Task Refresh_WithInvalidRequest_ReturnsValidationErrors()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/refresh", new RefreshTokenRequest
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
            DisplayName = "Refresh User"
        });

        response.EnsureSuccessStatusCode();

        var authResponse = await response.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(authResponse);

        return authResponse;
    }
}
