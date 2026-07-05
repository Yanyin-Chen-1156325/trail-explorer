using System.Net;
using System.Net.Http.Json;
using backend.DTOs.Auth;

namespace backend.Tests.Integration.Auth;

public class LoginIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public LoginIntegrationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsAuthResponse()
    {
        var client = _factory.CreateClient();
        var registerRequest = CreateRegisterRequest("valid.login@example.com");

        await client.PostAsJsonAsync("/api/auth/register", registerRequest);

        var response = await client.PostAsJsonAsync("/api/auth/login", new LoginRequest
        {
            Email = registerRequest.Email,
            Password = registerRequest.Password
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var authResponse = await response.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(authResponse);
        Assert.Equal(registerRequest.Email, authResponse.Email);
        Assert.Equal(registerRequest.DisplayName, authResponse.DisplayName);
        Assert.False(string.IsNullOrWhiteSpace(authResponse.AccessToken));
        Assert.False(string.IsNullOrWhiteSpace(authResponse.RefreshToken));
    }

    [Fact]
    public async Task Login_WithWrongPassword_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();
        var registerRequest = CreateRegisterRequest("wrong.password@example.com");

        await client.PostAsJsonAsync("/api/auth/register", registerRequest);

        var response = await client.PostAsJsonAsync("/api/auth/login", new LoginRequest
        {
            Email = registerRequest.Email,
            Password = "WrongPassword123"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);

        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("Invalid email or password", body);
    }

    [Fact]
    public async Task Login_WithUnknownEmail_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/login", new LoginRequest
        {
            Email = "unknown.login@example.com",
            Password = "Password123"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);

        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("Invalid email or password", body);
    }

    [Fact]
    public async Task Login_WithInvalidRequest_ReturnsValidationErrors()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/login", new LoginRequest
        {
            Email = "",
            Password = "weak"
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("Validation failed", body);
        Assert.Contains("Email is required", body);
        Assert.Contains("Password must be at least 8 characters", body);
    }

    private static RegisterRequest CreateRegisterRequest(string email)
    {
        return new RegisterRequest
        {
            Email = email,
            Password = "Password123",
            DisplayName = "Login User"
        };
    }
}
