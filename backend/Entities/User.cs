using backend.Enums;

namespace backend.Entities;

public class User
{
    public Guid Id { get; set; }

    public string Email { get; set; } = string.Empty;

    public string? PasswordHash { get; set; }

    public string DisplayName { get; set; } = string.Empty;

    public UserRole Role { get; set; }

    public UserStatus Status { get; set; }

    public AuthProvider AuthProvider { get; set; }

    public string? ProviderUserId { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public ICollection<RefreshToken> RefreshTokens { get; set; } = [];

    public ICollection<CheckIn> CheckIns { get; set; } = [];
}
