# Database Development Skill

## Purpose

Use this skill whenever implementing database-related tasks.

This skill is the source of truth for:

* Entities
* Enums
* Relationships
* DbContext
* Entity Framework Configuration
* Migrations

This skill does NOT define:

* API Endpoints
* Services
* Controllers
* DTOs
* Validation
* Frontend Code

Those concerns belong to other skills.

---

# Project Structure

Database files must be placed in the following folders:

backend/

├── Entities/
├── Enums/
├── Data/
└── Configurations/

### Entities

Location:

backend/Entities

Examples:

* User
* RefreshToken
* Trail
* CheckIn
* Badge
* UserBadge

### Enums

Location:

backend/Enums

Examples:

* UserRole
* UserStatus
* AuthProvider
* TrailDifficulty
* BadgeType

### DbContext

Location:

backend/Data

Example:

* ApplicationDbContext

### Entity Configurations

Location:

backend/Configurations

Example:

* UserConfiguration
* RefreshTokenConfiguration
* TrailConfiguration

Use IEntityTypeConfiguration<T>.

Do not place large EF configurations inside DbContext.

---

# General Rules

Use:

* Guid primary keys
* Nullable reference types
* Entity Framework Core
* Navigation properties only when explicitly allowed

Do not:

* Create placeholder entities
* Create future entities
* Create future relationships
* Create temporary classes to satisfy compilation

Only implement what is explicitly allowed by the current epic.

Keep the project buildable after each completed roadmap task.

Prefer small commits.

---

# Entity Standards

All entities should:

* Use Guid primary keys
* Use PascalCase naming
* Use nullable reference types
* Contain domain data only

Do not place:

* Business logic
* Validation logic
* Service logic

inside entities.

---

# Epic Resolution Rule

Determine the current epic from roadmap.md.

Only use rules from that epic.

Ignore future epic rules.

Never implement entities from future epics.

---

# Epic 1 - Authentication

## Allowed Enums

* UserRole
* UserStatus
* AuthProvider

## Allowed Entities

* User
* RefreshToken

## User

Generate:

```csharp
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
}
```

## RefreshToken

Generate:

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

## Forbidden

Do not create:

* Trail
* CheckIn
* Badge
* UserBadge

Do not add:

```csharp
public ICollection<CheckIn> CheckIns { get; set; }

public ICollection<UserBadge> UserBadges { get; set; }
```

---

# Epic 2 - Trail Discovery

## Allowed Enums

* TrailDifficulty

## Allowed Entities

* Trail

## Trail

Generate:

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

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}
```

## Forbidden

Do not create:

* CheckIn
* Badge
* UserBadge

---

# Epic 4 - Check-In System

## Allowed Entities

* CheckIn

## Add Relationships

User

```csharp
public ICollection<CheckIn> CheckIns { get; set; } = [];
```

Trail

```csharp
public ICollection<CheckIn> CheckIns { get; set; } = [];
```

## Generate

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

# Epic 6 - Achievement System

## Allowed Enums

* BadgeType

## Allowed Entities

* Badge
* UserBadge

## Add Relationships

User

```csharp
public ICollection<UserBadge> UserBadges { get; set; } = [];
```

## Badge

Generate:

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

## UserBadge

Generate:

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

Use composite key:

```csharp
builder.HasKey(x => new
{
    x.UserId,
    x.BadgeId
});
```

---

# Migrations

Only create migrations when the roadmap task explicitly requires it.

Migration names should be descriptive.

Examples:

* AddUserEntity
* AddRefreshTokenEntity
* AddTrailEntity
* AddCheckInEntity

---

# Final Rule

Never create entities from future epics.

Never create relationships from future epics.

Never infer missing entities.

Only generate entities explicitly allowed by the current epic.
