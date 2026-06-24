# Database Development Skill

## Purpose

Implement database entities incrementally following the project roadmap.

The schema.md file represents the final database design.

Do not implement all entities at once.

Only implement entities required by the current epic.

---

## Epic 1 - Authentication

Allowed:

* User
* RefreshToken
* UserRole
* UserStatus
* AuthProvider

Do not implement:

* Trail
* CheckIn
* Badge
* UserBadge

When creating User:

Generate only:

```csharp
public ICollection<RefreshToken> RefreshTokens { get; set; } = [];
```

Do not generate:

```csharp
public ICollection<CheckIn> CheckIns { get; set; }

public ICollection<UserBadge> UserBadges { get; set; }
```

These relationships will be added in later epics.

---

## Epic 2 - Trail Discovery

Allowed:

* Trail
* TrailDifficulty

Do not implement:

* CheckIn
* Badge
* UserBadge

---

## Epic 4 - Check-In System

Allowed:

* CheckIn

Add relationships:

```csharp
User.CheckIns
Trail.CheckIns
```

---

## Epic 6 - Badge System

Allowed:

* Badge
* UserBadge
* BadgeType

Add relationships:

```csharp
User.UserBadges
```

---

## General Rules

* Follow schema.md as the source of truth
* Implement only entities required by the current epic
* Do not generate future entities
* Do not generate future relationships
* Ensure the project builds successfully after each step
* Prefer small commits over large changes
