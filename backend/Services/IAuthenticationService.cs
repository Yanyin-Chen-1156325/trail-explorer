using backend.DTOs.Auth;

namespace backend.Services;

public interface IAuthenticationService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);

    Task<AuthResponse> LoginAsync(LoginRequest request);

    Task<AuthResponse> RefreshAsync(string refreshToken);

    Task LogoutAsync(string refreshToken);
}