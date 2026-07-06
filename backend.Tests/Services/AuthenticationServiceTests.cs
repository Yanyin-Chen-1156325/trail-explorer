using backend.Authentication;
using backend.Data;
using backend.DTOs.Auth;
using backend.DTOs.User;
using backend.Entities;
using backend.Enums;
using backend.Services;
using Google.Apis.Auth;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;

namespace backend.Tests.Services;

public class AuthenticationServiceTests
{
    private static readonly JwtOptions JwtOptions = new()
    {
        Secret = "your-super-secret-jwt-key-min-32-characters-long!",
        Issuer = "TrailExplorer",
        Audience = "TrailExplorerAPI",
        AccessTokenExpirationMinutes = 15,
        RefreshTokenExpirationDays = 7
    };

    private static readonly GoogleOAuthOptions GoogleOAuthOptions = new()
    {
        ClientId = "google-client-id"
    };

    [Fact]
    public async Task RegisterAsync_CreatesUserAndRefreshToken()
    {
        using var database = CreateDatabase();
        var tokenGenerator = CreateTokenGeneratorMock("access-token", "refresh-token", DateTime.UtcNow.AddMinutes(15));
        var service = CreateService(database.Context, tokenGenerator.Object);

        var response = await service.RegisterAsync(new RegisterRequest
        {
            Email = "new.user@example.com",
            Password = "Password123",
            DisplayName = "New User"
        });

        Assert.Equal("new.user@example.com", response.Email);
        Assert.Equal("New User", response.DisplayName);
        Assert.Equal("access-token", response.AccessToken);
        Assert.Equal("refresh-token", response.RefreshToken);

        var createdUser = await database.Context.Users.SingleAsync();
        Assert.Equal(AuthProvider.Local, createdUser.AuthProvider);
        Assert.Equal(UserRole.User, createdUser.Role);
        Assert.NotEqual("Password123", createdUser.PasswordHash);

        var createdRefreshToken = await database.Context.RefreshTokens.SingleAsync();
        Assert.Equal("refresh-token", createdRefreshToken.Token);
        Assert.False(createdRefreshToken.IsRevoked);
        tokenGenerator.Verify(x => x.GenerateAccessToken(createdUser.Id, createdUser.Email, UserRole.User.ToString()), Times.Once);
    }

    [Fact]
    public async Task RegisterAsync_WhenEmailExists_ThrowsInvalidOperationException()
    {
        using var database = CreateDatabase();
        database.Context.Users.Add(new User
        {
            Id = Guid.NewGuid(),
            Email = "existing@example.com",
            DisplayName = "Existing User",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123"),
            Role = UserRole.User,
            Status = UserStatus.Active,
            AuthProvider = AuthProvider.Local,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        await database.Context.SaveChangesAsync();

        var service = CreateService(database.Context, CreateTokenGeneratorMock().Object);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => service.RegisterAsync(new RegisterRequest
        {
            Email = "existing@example.com",
            Password = "Password123",
            DisplayName = "Duplicate"
        }));

        Assert.Equal("Email already registered", exception.Message);
    }

    [Fact]
    public async Task LoginAsync_WithValidCredentials_ReturnsAuthResponse()
    {
        using var database = CreateDatabase();
        var password = "Password123";
        database.Context.Users.Add(new User
        {
            Id = Guid.NewGuid(),
            Email = "login@example.com",
            DisplayName = "Login User",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Role = UserRole.User,
            Status = UserStatus.Active,
            AuthProvider = AuthProvider.Local,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        await database.Context.SaveChangesAsync();

        var tokenGenerator = CreateTokenGeneratorMock("login-access-token", "login-refresh-token", DateTime.UtcNow.AddMinutes(15));
        var service = CreateService(database.Context, tokenGenerator.Object);

        var response = await service.LoginAsync(new LoginRequest
        {
            Email = "login@example.com",
            Password = password
        });

        Assert.Equal("login@example.com", response.Email);
        Assert.Equal("login-access-token", response.AccessToken);
        Assert.Equal("login-refresh-token", response.RefreshToken);
    }

    [Fact]
    public async Task LoginAsync_WithWrongPassword_ThrowsUnauthorizedAccessException()
    {
        using var database = CreateDatabase();
        database.Context.Users.Add(new User
        {
            Id = Guid.NewGuid(),
            Email = "login@example.com",
            DisplayName = "Login User",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123"),
            Role = UserRole.User,
            Status = UserStatus.Active,
            AuthProvider = AuthProvider.Local,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        await database.Context.SaveChangesAsync();

        var service = CreateService(database.Context, CreateTokenGeneratorMock().Object);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => service.LoginAsync(new LoginRequest
        {
            Email = "login@example.com",
            Password = "WrongPassword123"
        }));
    }

    [Fact]
    public async Task RefreshAsync_RotatesRefreshToken()
    {
        using var database = CreateDatabase();
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "refresh@example.com",
            DisplayName = "Refresh User",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123"),
            Role = UserRole.User,
            Status = UserStatus.Active,
            AuthProvider = AuthProvider.Local,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        database.Context.Users.Add(user);
        database.Context.RefreshTokens.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = "old-refresh-token",
            ExpiresAt = DateTime.UtcNow.AddDays(1),
            IsRevoked = false,
            CreatedAt = DateTime.UtcNow
        });
        await database.Context.SaveChangesAsync();

        var tokenGenerator = CreateTokenGeneratorMock("refreshed-access-token", "new-refresh-token", DateTime.UtcNow.AddMinutes(15));
        var service = CreateService(database.Context, tokenGenerator.Object);

        var response = await service.RefreshAsync("old-refresh-token");

        Assert.Equal("refreshed-access-token", response.AccessToken);
        Assert.Equal("new-refresh-token", response.RefreshToken);

        var oldToken = await database.Context.RefreshTokens.SingleAsync(token => token.Token == "old-refresh-token");
        var newToken = await database.Context.RefreshTokens.SingleAsync(token => token.Token == "new-refresh-token");

        Assert.True(oldToken.IsRevoked);
        Assert.NotNull(oldToken.RevokedAt);
        Assert.False(newToken.IsRevoked);
    }

    [Fact]
    public async Task LogoutAsync_RevokesRefreshToken()
    {
        using var database = CreateDatabase();
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "logout@example.com",
            DisplayName = "Logout User",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123"),
            Role = UserRole.User,
            Status = UserStatus.Active,
            AuthProvider = AuthProvider.Local,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        database.Context.Users.Add(user);
        database.Context.RefreshTokens.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = "logout-refresh-token",
            ExpiresAt = DateTime.UtcNow.AddDays(1),
            IsRevoked = false,
            CreatedAt = DateTime.UtcNow
        });
        await database.Context.SaveChangesAsync();

        var service = CreateService(database.Context, CreateTokenGeneratorMock().Object);

        await service.LogoutAsync("logout-refresh-token");

        var token = await database.Context.RefreshTokens.SingleAsync();
        Assert.True(token.IsRevoked);
        Assert.NotNull(token.RevokedAt);
    }

    [Fact]
    public async Task GoogleOAuthAsync_WithValidToken_CreatesGoogleUserAndRefreshToken()
    {
        using var database = CreateDatabase();
        var googlePayload = new GoogleJsonWebSignature.Payload
        {
            Email = "google.user@example.com",
            Name = "Google User",
            Subject = "google-subject-1",
            EmailVerified = true
        };

        var googleTokenValidator = new Mock<IGoogleTokenValidator>();
        googleTokenValidator
            .Setup(x => x.ValidateAsync("id-token", GoogleOAuthOptions.ClientId))
            .ReturnsAsync(googlePayload);

        var tokenGenerator = CreateTokenGeneratorMock("google-access-token", "google-refresh-token", DateTime.UtcNow.AddMinutes(15));
        var service = CreateService(database.Context, tokenGenerator.Object, googleTokenValidator.Object);

        var response = await service.GoogleOAuthAsync(new GoogleOAuthRequest
        {
            IdToken = "id-token",
            CreateAccount = true
        });

        Assert.Equal("google.user@example.com", response.Email);
        Assert.Equal("Google User", response.DisplayName);
        Assert.Equal("google-access-token", response.AccessToken);
        Assert.Equal("google-refresh-token", response.RefreshToken);

        var createdUser = await database.Context.Users.SingleAsync();
        Assert.Equal(AuthProvider.Google, createdUser.AuthProvider);
        Assert.Equal("google-subject-1", createdUser.ProviderUserId);

        var createdRefreshToken = await database.Context.RefreshTokens.SingleAsync();
        Assert.Equal("google-refresh-token", createdRefreshToken.Token);
    }

    [Fact]
    public async Task GoogleOAuthAsync_WhenLoginModeAndGoogleUserDoesNotExist_ThrowsKeyNotFoundException()
    {
        using var database = CreateDatabase();
        var googlePayload = new GoogleJsonWebSignature.Payload
        {
            Email = "missing.google@example.com",
            Name = "Missing Google User",
            Subject = "missing-google-subject",
            EmailVerified = true
        };

        var googleTokenValidator = new Mock<IGoogleTokenValidator>();
        googleTokenValidator
            .Setup(x => x.ValidateAsync("id-token", GoogleOAuthOptions.ClientId))
            .ReturnsAsync(googlePayload);

        var service = CreateService(
            database.Context,
            CreateTokenGeneratorMock().Object,
            googleTokenValidator.Object);

        var exception = await Assert.ThrowsAsync<KeyNotFoundException>(() => service.GoogleOAuthAsync(new GoogleOAuthRequest
        {
            IdToken = "id-token",
            CreateAccount = false
        }));

        Assert.Equal("Google account not found. Please create an account first.", exception.Message);
        Assert.False(await database.Context.Users.AnyAsync());
    }

    [Fact]
    public async Task GoogleOAuthAsync_WhenTokenInvalid_ThrowsUnauthorizedAccessException()
    {
        using var database = CreateDatabase();
        var googleTokenValidator = new Mock<IGoogleTokenValidator>();
        googleTokenValidator
            .Setup(x => x.ValidateAsync("id-token", GoogleOAuthOptions.ClientId))
            .ThrowsAsync(new InvalidJwtException("invalid token"));

        var service = CreateService(database.Context, CreateTokenGeneratorMock().Object, googleTokenValidator.Object);

        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(() => service.GoogleOAuthAsync(new GoogleOAuthRequest
        {
            IdToken = "id-token"
        }));

        Assert.Equal("Invalid Google ID token", exception.Message);
    }

    private static AuthenticationService CreateService(
        ApplicationDbContext context,
        IJwtTokenGenerator tokenGenerator,
        IGoogleTokenValidator? googleTokenValidator = null)
    {
        return new AuthenticationService(
            context,
            tokenGenerator,
            googleTokenValidator ?? Mock.Of<IGoogleTokenValidator>(),
            Mock.Of<ILogger<AuthenticationService>>(),
            Options.Create(JwtOptions),
            Options.Create(GoogleOAuthOptions));
    }

    private static Mock<IJwtTokenGenerator> CreateTokenGeneratorMock(
        string accessToken = "access-token",
        string refreshToken = "refresh-token",
        DateTime? expiration = null)
    {
        var mock = new Mock<IJwtTokenGenerator>();
        mock.Setup(x => x.GenerateAccessToken(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<string>()))
            .Returns(accessToken);
        mock.Setup(x => x.GenerateRefreshToken())
            .Returns(refreshToken);
        mock.Setup(x => x.GetAccessTokenExpiration())
            .Returns(expiration ?? DateTime.UtcNow.AddMinutes(15));
        return mock;
    }

    private static TestDatabase CreateDatabase()
    {
        return new TestDatabase();
    }

    private sealed class TestDatabase : IDisposable
    {
        private readonly SqliteConnection _connection;

        public TestDatabase()
        {
            _connection = new SqliteConnection("Data Source=:memory:");
            _connection.Open();

            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlite(_connection)
                .Options;

            Context = new ApplicationDbContext(options);
            Context.Database.EnsureCreated();
        }

        public ApplicationDbContext Context { get; }

        public void Dispose()
        {
            Context.Dispose();
            _connection.Dispose();
        }
    }
}
