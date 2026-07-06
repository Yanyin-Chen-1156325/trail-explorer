using System.Net;
using System.Net.Http.Json;
using backend.Authentication;
using backend.Data;
using backend.DTOs.Auth;
using backend.Enums;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Moq;

namespace backend.Tests.Integration.Auth;

public class OAuthIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public OAuthIntegrationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GoogleOAuth_WithValidToken_CreatesGoogleUserAndReturnsAuthResponse()
    {
        var payload = CreateGooglePayload("google.new@example.com", "Google New User", "google-subject-new");
        using var factory = CreateFactoryWithGooglePayload("valid-google-token", payload);
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/google", new GoogleOAuthRequest
        {
            IdToken = "valid-google-token",
            CreateAccount = true
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var authResponse = await response.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(authResponse);
        Assert.Equal(payload.Email, authResponse.Email);
        Assert.Equal(payload.Name, authResponse.DisplayName);
        Assert.False(string.IsNullOrWhiteSpace(authResponse.AccessToken));
        Assert.False(string.IsNullOrWhiteSpace(authResponse.RefreshToken));

        using var scope = factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var user = await dbContext.Users.SingleAsync(x => x.Email == payload.Email);

        Assert.Equal(AuthProvider.Google, user.AuthProvider);
        Assert.Equal(payload.Subject, user.ProviderUserId);
        Assert.Equal(UserRole.User, user.Role);
        Assert.Equal(UserStatus.Active, user.Status);
        Assert.Null(user.PasswordHash);
    }

    [Fact]
    public async Task GoogleOAuth_WithExistingGoogleUser_ReturnsAuthResponse()
    {
        var payload = CreateGooglePayload("google.existing@example.com", "Original Name", "google-subject-existing");
        using var factory = CreateFactoryWithGooglePayload("existing-google-token", payload);
        var client = factory.CreateClient();

        var firstResponse = await client.PostAsJsonAsync("/api/auth/google", new GoogleOAuthRequest
        {
            IdToken = "existing-google-token",
            CreateAccount = true
        });
        var secondResponse = await client.PostAsJsonAsync("/api/auth/google", new GoogleOAuthRequest
        {
            IdToken = "existing-google-token"
        });

        Assert.Equal(HttpStatusCode.OK, firstResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, secondResponse.StatusCode);

        var authResponse = await secondResponse.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(authResponse);
        Assert.Equal(payload.Email, authResponse.Email);

        using var scope = factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var userCount = await dbContext.Users.CountAsync(x => x.Email == payload.Email);

        Assert.Equal(1, userCount);
    }

    [Fact]
    public async Task GoogleOAuth_WhenLoginModeAndGoogleUserDoesNotExist_ReturnsNotFound()
    {
        var payload = CreateGooglePayload("google.missing@example.com", "Missing Google User", "google-subject-missing");
        using var factory = CreateFactoryWithGooglePayload("missing-google-token", payload);
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/google", new GoogleOAuthRequest
        {
            IdToken = "missing-google-token",
            CreateAccount = false
        });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("Google account not found. Please create an account first.", body);

        using var scope = factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var userExists = await dbContext.Users.AnyAsync(x => x.Email == payload.Email);

        Assert.False(userExists);
    }

    [Fact]
    public async Task GoogleOAuth_WithInvalidToken_ReturnsUnauthorized()
    {
        using var factory = CreateFactoryWithInvalidGoogleToken("invalid-google-token");
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/google", new GoogleOAuthRequest
        {
            IdToken = "invalid-google-token"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);

        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("Invalid Google ID token", body);
    }

    [Fact]
    public async Task GoogleOAuth_WhenEmailAlreadyRegisteredLocally_ReturnsConflict()
    {
        var email = "local.conflict@example.com";
        var payload = CreateGooglePayload(email, "Google Conflict User", "google-subject-conflict");
        using var factory = CreateFactoryWithGooglePayload("conflict-google-token", payload);
        var client = factory.CreateClient();

        var registerResponse = await client.PostAsJsonAsync("/api/auth/register", new RegisterRequest
        {
            Email = email,
            Password = "Password123",
            DisplayName = "Local User"
        });
        var googleResponse = await client.PostAsJsonAsync("/api/auth/google", new GoogleOAuthRequest
        {
            IdToken = "conflict-google-token",
            CreateAccount = true
        });

        Assert.Equal(HttpStatusCode.OK, registerResponse.StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, googleResponse.StatusCode);

        var body = await googleResponse.Content.ReadAsStringAsync();
        Assert.Contains("Email already registered with local login", body);
    }

    [Fact]
    public async Task GoogleOAuth_WithInvalidRequest_ReturnsValidationErrors()
    {
        using var factory = CreateFactoryWithGooglePayload(
            "unused-google-token",
            CreateGooglePayload("unused.google@example.com", "Unused User", "unused-subject"));
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/google", new GoogleOAuthRequest
        {
            IdToken = ""
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("Validation failed", body);
        Assert.Contains("Google ID token is required", body);
    }

    private WebApplicationFactory<Program> CreateFactoryWithGooglePayload(
        string expectedToken,
        GoogleJsonWebSignature.Payload payload)
    {
        var googleTokenValidator = new Mock<IGoogleTokenValidator>();
        googleTokenValidator
            .Setup(x => x.ValidateAsync(expectedToken, "test-google-client-id"))
            .ReturnsAsync(payload);

        return CreateFactoryWithGoogleTokenValidator(googleTokenValidator.Object);
    }

    private WebApplicationFactory<Program> CreateFactoryWithInvalidGoogleToken(string expectedToken)
    {
        var googleTokenValidator = new Mock<IGoogleTokenValidator>();
        googleTokenValidator
            .Setup(x => x.ValidateAsync(expectedToken, "test-google-client-id"))
            .ThrowsAsync(new InvalidJwtException("invalid token"));

        return CreateFactoryWithGoogleTokenValidator(googleTokenValidator.Object);
    }

    private WebApplicationFactory<Program> CreateFactoryWithGoogleTokenValidator(
        IGoogleTokenValidator googleTokenValidator)
    {
        return _factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureTestServices(services =>
            {
                services.RemoveAll<IGoogleTokenValidator>();
                services.AddSingleton(googleTokenValidator);
            });
        });
    }

    private static GoogleJsonWebSignature.Payload CreateGooglePayload(
        string email,
        string name,
        string subject)
    {
        return new GoogleJsonWebSignature.Payload
        {
            Email = email,
            Name = name,
            Subject = subject,
            EmailVerified = true
        };
    }
}
