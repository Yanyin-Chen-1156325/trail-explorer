## User
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

    public ICollection<CheckIn> CheckIns { get; set; } = [];

    public ICollection<UserBadge> UserBadges { get; set; } = [];
}

## Trail

public class Trail
{
    public Guid Id { get; set; }

    public string DocId { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string City { get; set; } = string.Empty;

    public string Region { get; set; } = string.Empty;

    public TrailDifficulty Difficulty { get; set; }

    public decimal DistanceKm { get; set; }

    public string Description { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public ICollection<CheckIn> CheckIns { get; set; } = [];
}

## CheckIn

public class CheckIn
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public Guid TrailId { get; set; }

    public DateTime CompletedDate { get; set; }

    public string? Notes { get; set; }

    public string? PhotoUrl { get; set; }

    public User User { get; set; } = null!;

    public Trail Trail { get; set; } = null!;
}

## Badge

public class Badge
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string IconUrl { get; set; } = string.Empty;
}
## UserBadge

public class UserBadge
{
    public Guid UserId { get; set; }

    public Guid BadgeId { get; set; }

    public DateTime UnlockedAt { get; set; }

    public User User { get; set; } = null!;

    public Badge Badge { get; set; } = null!;
}

Composite Key：

builder.HasKey(x => new
{
    x.UserId,
    x.BadgeId
});

## RefreshToken

public class RefreshToken
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string Token { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }

    public bool IsRevoked { get; set; }

    public User User { get; set; } = null!;
}
