# Trail Explorer Database Schema

## Design Principles

* Use Guid as primary keys
* Use Entity Framework Core relationships
* Use nullable reference types
* Use normalized relational design
* Do not store XP, Level, Streak, or Leaderboard data
* XP, Level, Streak, and Leaderboard are calculated dynamically

---

# Enums

## UserRole

```csharp
public enum UserRole
{
    User = 1,
    Moderator = 2,
    Admin = 3
}
```

## UserStatus

```csharp
public enum UserStatus
{
    Active = 1,
    Suspended = 2
}
```

## AuthProvider

```csharp
public enum AuthProvider
{
    Local = 1,
    Google = 2
}
```

## TrailDifficulty

```csharp
public enum TrailDifficulty
{
    Easy = 1,
    Intermediate = 2,
    Advanced = 3,
    Expert = 4
}
```

## BadgeType

```csharp
public enum BadgeType
{
    Completion = 1,
    Distance = 2,
    Region = 3,
    Difficulty = 4,
    Streak = 5
}
```

---

# User

```csharp
public class User
{
    public Guid Id { get; set; }

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string DisplayName { get; set; } = string.Empty;

    public UserRole Role { get; set; }

    public UserStatus Status { get; set; }

    public AuthProvider AuthProvider { get; set; }

    public string? ProviderUserId { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public ICollection<CheckIn> CheckIns { get; set; } = [];

    public ICollection<UserBadge> UserBadges { get; set; } = [];

    public ICollection<RefreshToken> RefreshTokens { get; set; } = [];
}
```

---

# Trail

```csharp
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

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public ICollection<CheckIn> CheckIns { get; set; } = [];
}
```

---

# CheckIn

```csharp
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
```

---

# Badge

```csharp
public class Badge
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string IconUrl { get; set; } = string.Empty;

    public BadgeType Type { get; set; }
}
```

---

# UserBadge

```csharp
public class UserBadge
{
    public Guid UserId { get; set; }

    public Guid BadgeId { get; set; }

    public DateTime UnlockedAt { get; set; }

    public User User { get; set; } = null!;

    public Badge Badge { get; set; } = null!;
}
```

Composite Key:

```csharp
builder.HasKey(x => new
{
    x.UserId,
    x.BadgeId
});
```

---

# RefreshToken

```csharp
public class RefreshToken
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string Token { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }

    public bool IsRevoked { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? RevokedAt { get; set; }

    public User User { get; set; } = null!;
}
```

---

# Relationships

User

* 1 → Many CheckIns
* 1 → Many RefreshTokens
* 1 → Many UserBadges

Trail

* 1 → Many CheckIns

Badge

* 1 → Many UserBadges

UserBadge

* Many → Many bridge table between User and Badge

CheckIn

* Many → 1 User
* Many → 1 Trail

RefreshToken

* Many → 1 User

---

# Calculated Values (Not Stored)

The following values must be calculated dynamically:

* Total XP
* Current Level
* Weekly Streak
* Completed Trail Count
* Total Distance
* Leaderboard Rank

No database tables should be created for:

* XP
* Level
* Streak
* Leaderboard

```
```
