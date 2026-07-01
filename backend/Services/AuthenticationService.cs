using backend.Authentication;
using backend.Data;
using backend.DTOs.Auth;
using backend.Entities;
using backend.Enums;
using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace backend.Services;

public class AuthenticationService : IAuthenticationService
{
    private readonly ApplicationDbContext _context;
    private readonly IJwtTokenGenerator _tokenGenerator;
    private readonly IGoogleTokenValidator _googleTokenValidator;
    private readonly ILogger<AuthenticationService> _logger;
    private readonly JwtOptions _jwtOptions;
    private readonly GoogleOAuthOptions _googleOAuthOptions;

    public AuthenticationService(
        ApplicationDbContext context,
        IJwtTokenGenerator tokenGenerator,
        IGoogleTokenValidator googleTokenValidator,
        ILogger<AuthenticationService> logger,
        IOptions<JwtOptions> jwtOptions,
        IOptions<GoogleOAuthOptions> googleOAuthOptions)
    {
        _context = context;
        _tokenGenerator = tokenGenerator;
        _googleTokenValidator = googleTokenValidator;
        _logger = logger;
        _jwtOptions = jwtOptions.Value;
        _googleOAuthOptions = googleOAuthOptions.Value;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (existingUser != null)
        {
            _logger.LogWarning("Registration attempt with existing email: {Email}", request.Email);
            throw new InvalidOperationException("Email already registered");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            DisplayName = request.DisplayName,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = UserRole.User,
            Status = UserStatus.Active,
            AuthProvider = AuthProvider.Local,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        _logger.LogInformation("User registered successfully: {UserId}", user.Id);

        return await CreateAuthResponseAsync(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || user.PasswordHash == null)
        {
            _logger.LogWarning("Login failed for email: {Email}", request.Email);
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        if (user.AuthProvider != AuthProvider.Local || user.Status != UserStatus.Active)
        {
            _logger.LogWarning("Login denied for email: {Email}", request.Email);
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            _logger.LogWarning("Login failed for email: {Email}", request.Email);
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        _logger.LogInformation("User logged in successfully: {UserId}", user.Id);

        return await CreateAuthResponseAsync(user);
    }

    public async Task<AuthResponse> GoogleOAuthAsync(GoogleOAuthRequest request)
    {
        if (string.IsNullOrWhiteSpace(_googleOAuthOptions.ClientId))
        {
            throw new InvalidOperationException("Google OAuth client ID is not configured");
        }

        GoogleJsonWebSignature.Payload payload;

        try
        {
            payload = await _googleTokenValidator.ValidateAsync(request.IdToken, _googleOAuthOptions.ClientId);
        }
        catch (InvalidJwtException ex)
        {
            throw new UnauthorizedAccessException("Invalid Google ID token", ex);
        }

        if (string.IsNullOrWhiteSpace(payload.Email))
        {
            throw new UnauthorizedAccessException("Google account did not provide an email address");
        }

        if (!payload.EmailVerified)
        {
            throw new UnauthorizedAccessException("Google account email is not verified");
        }

        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.ProviderUserId == payload.Subject || u.Email == payload.Email);

        if (existingUser is not null)
        {
            if (existingUser.AuthProvider == AuthProvider.Local)
            {
                throw new InvalidOperationException("Email already registered with local login");
            }

            if (existingUser.Status != UserStatus.Active)
            {
                throw new UnauthorizedAccessException("User inactive");
            }

            existingUser.ProviderUserId = payload.Subject;
            existingUser.DisplayName = string.IsNullOrWhiteSpace(payload.Name)
                ? existingUser.DisplayName
                : payload.Name;
            existingUser.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Google OAuth user signed in successfully: {UserId}", existingUser.Id);

            return await CreateAuthResponseAsync(existingUser);
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = payload.Email,
            DisplayName = string.IsNullOrWhiteSpace(payload.Name)
                ? payload.Email.Split('@', 2)[0]
                : payload.Name,
            PasswordHash = null,
            Role = UserRole.User,
            Status = UserStatus.Active,
            AuthProvider = AuthProvider.Google,
            ProviderUserId = payload.Subject,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Google OAuth user created successfully: {UserId}", user.Id);

        return await CreateAuthResponseAsync(user);
    }

    private async Task<AuthResponse> CreateAuthResponseAsync(User user)
    {
        var accessToken = _tokenGenerator.GenerateAccessToken(
            user.Id,
            user.Email,
            user.Role.ToString());

        var refreshTokenString = _tokenGenerator.GenerateRefreshToken();
        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = refreshTokenString,
            ExpiresAt = DateTime.UtcNow.AddDays(_jwtOptions.RefreshTokenExpirationDays),
            IsRevoked = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        return new AuthResponse
        {
            UserId = user.Id,
            Email = user.Email,
            DisplayName = user.DisplayName,
            AccessToken = accessToken,
            RefreshToken = refreshTokenString,
            ExpiresAt = _tokenGenerator.GetAccessTokenExpiration()
        };
    }

    public async Task<AuthResponse> RefreshAsync(string refreshToken)
    {
        var token = await _context.RefreshTokens
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.Token == refreshToken);

        if (token is null)
        {
            throw new UnauthorizedAccessException("Invalid refresh token");
        }

        if (token.IsRevoked)
        {
            throw new UnauthorizedAccessException("Refresh token revoked");
        }

        if (token.ExpiresAt <= DateTime.UtcNow)
        {
            throw new UnauthorizedAccessException("Refresh token expired");
        }

        if (token.User.Status != UserStatus.Active)
        {
            throw new UnauthorizedAccessException("User inactive");
        }

        await RevokeRefreshTokenAsync(token);

        var newRefreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = token.UserId,
            Token = _tokenGenerator.GenerateRefreshToken(),
            ExpiresAt = DateTime.UtcNow.AddDays(_jwtOptions.RefreshTokenExpirationDays),
            IsRevoked = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.RefreshTokens.Add(newRefreshToken);

        await _context.SaveChangesAsync();

        var accessToken = _tokenGenerator.GenerateAccessToken(
            token.User.Id,
            token.User.Email,
            token.User.Role.ToString());

        return new AuthResponse
        {
            UserId = token.User.Id,
            Email = token.User.Email,
            DisplayName = token.User.DisplayName,
            AccessToken = accessToken,
            RefreshToken = newRefreshToken.Token,
            ExpiresAt = _tokenGenerator.GetAccessTokenExpiration()
        };
    }

    public async Task LogoutAsync(string refreshToken)
    {
        var token = await _context.RefreshTokens
            .FirstOrDefaultAsync(x => x.Token == refreshToken);

        if (token is null)
        {
            throw new UnauthorizedAccessException("Invalid refresh token");
        }

        await RevokeRefreshTokenAsync(token);
    }

    private async Task RevokeRefreshTokenAsync(RefreshToken token)
    {
        if (!token.IsRevoked)
        {
            token.IsRevoked = true;
            token.RevokedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
}
