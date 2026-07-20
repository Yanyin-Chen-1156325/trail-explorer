# Backend Development Skill

## Purpose

Use this skill whenever implementing backend functionality.

This skill is responsible for:

* API Endpoints
* DTOs
* Services
* Validation
* Authentication
* Authorization
* Dependency Injection
* Caching
* Logging
* External Integrations

This skill is NOT responsible for:

* Entity definitions
* Enum definitions
* Entity relationships
* DbContext configuration
* EF Core migrations

Those concerns belong to Database Skill.

---

# Project Structure

Backend files should be placed in:

backend/

├── Controllers/
├── DTOs/
├── Services/
├── Validators/
├── Authentication/
├── Integrations/
└── Extensions/

---

# Architecture Rules

Use Service Layer Architecture.

Controllers must remain thin.

Business logic belongs in Services.

Use Dependency Injection.

Use async/await for all I/O operations.

Follow SOLID principles.

Keep methods small and focused.

Repository Pattern is NOT required.

Services may access DbContext directly.

---

# DTO Rules

Use DTOs for all API requests and responses.

Never expose EF Core entities directly.

Generate:

* Request DTOs
* Response DTOs

Examples:

```text id="zq56dq"
RegisterRequest
LoginRequest
TrailResponse
CheckInResponse
```

Separate Create and Update DTOs when appropriate.

---

# Service Rules

Business logic belongs in Services.

Services should:

* Have a single responsibility
* Be testable
* Be dependency injected

Examples:

```text id="onh1dr"
AuthenticationService
TrailService
CheckInService
DashboardService
LeaderboardService
```

Services may:

* Use DbContext
* Use External APIs
* Use Cache
* Use SignalR

Controllers should never contain business logic.

---

# Controller Rules

Controllers should:

* Receive requests
* Call services
* Return responses

Controllers should not:

* Access DbContext directly
* Perform calculations
* Implement business rules

Always use RESTful conventions.

Examples:

```text id="v62f63"
GET    /api/trails
GET    /api/trails/{id}

POST   /api/auth/register
POST   /api/auth/login

POST   /api/checkins

PUT    /api/checkins/{id}

DELETE /api/checkins/{id}
```

Return appropriate HTTP status codes.

Use ProblemDetails when appropriate.

---

# Validation Rules

Use FluentValidation.

Generate validators for:

* Request DTOs
* Authentication requests
* Create requests
* Update requests

Validate:

* Required fields
* Length limits
* Email format
* Business constraints

Examples:

```text id="0s8jot"
RegisterRequestValidator
LoginRequestValidator
CreateCheckInValidator
```

Validation belongs in Validators.

Do not place validation inside Controllers.

---

# Dependency Injection Rules

Register all services using DI.

Examples:

```csharp id="vfsk1t"
builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();

builder.Services.AddScoped<ITrailService, TrailService>();

builder.Services.AddScoped<ICheckInService, CheckInService>();
```

Keep registrations organized.

---

# Authentication Rules

Support:

* Email and Password Authentication
* Google OAuth

Generate:

* Register Endpoint
* Login Endpoint
* Refresh Token Endpoint
* Google OAuth Endpoint

Use:

* JWT
* Refresh Tokens
* BCrypt Password Hashing

Never store plain text passwords.

---

# JWT Rules

Generate:

```text id="mfdb99"
JwtOptions
JwtTokenGenerator
IJwtTokenGenerator
```

JWT should contain:

* User Id
* Email
* Role

Use configuration values from appsettings.

Token generation belongs in Authentication services.

---

# Authorization Rules
# Authorization Rules

Use Role-Based Authorization.

Roles:

```text
User
Moderator
Admin
```

## User Permissions

Standard application user.

Permissions:

* Browse trails
* Search trails
* View trail details
* Create check-ins
* Update own check-ins
* Delete own check-ins
* Upload trail photos
* Earn XP
* Unlock badges
* View dashboard
* View leaderboard

## Moderator Permissions

Community moderator.

Permissions:

* View all users
* View all check-ins
* View reported content (future feature)
* Hide inappropriate check-ins
* Restore hidden check-ins
* View moderation logs

Moderators cannot:

* Change user roles
* Access system administration features
* Trigger DOC synchronisation

## Admin Permissions

System administrator.

Permissions:

* View all users
* Update user roles
* Promote or demote moderators
* Access user management page
* Trigger DOC synchronisation
* View system statistics
* Access moderation logs
* Manage all system settings

Protect endpoints using Authorize attributes.

Examples:

```csharp
[Authorize]

[Authorize(Roles = "Moderator,Admin")]

[Authorize(Roles = "Admin")]
```

Generate Admin APIs when required:

```text
GET    /api/users
PUT    /api/users/{id}/role
POST   /api/admin/trails/sync
```

Generate Moderator APIs when required:

```text
GET    /api/checkins
PUT    /api/checkins/{id}/hide
PUT    /api/checkins/{id}/restore
```

Authorization rules belong in Controllers and Services.

Check-In update and delete operations must validate ownership.

Example:

```csharp
if (checkIn.UserId != currentUserId)
{
    return Forbid();
}
```

| Feature          | User | Moderator | Admin |
| ---------------- | ---- | --------- | ----- |
| Browse Trails    | ✅    | ✅         | ✅     |
| Check-In         | ✅    | ✅         | ✅     |
| XP / Badge       | ✅    | ✅         | ✅     |
| View Users       | ❌    | ✅         | ✅     |
| Hide Check-In    | ❌    | ✅         | ✅     |
| Restore Check-In | ❌    | ✅         | ✅     |
| Change User Role | ❌    | ❌         | ✅     |
| Trigger DOC Sync | ❌    | ❌         | ✅     |

---

# Logging Rules

Use ILogger.

Log important events:

* User Registration
* User Login
* Trail Completion
* Badge Unlock
* DOC Synchronisation
* Application Errors

Use structured logging.

Do not use Console.WriteLine.

---

# Caching Rules

Use IMemoryCache.

Cache:

* Trail List
* Trail Details
* Leaderboard

Cache logic belongs in Services.

Invalidate cache when data changes.

---

# DOC Integration Rules

When implementing DOC synchronisation:

Generate:

* DTO Models
* API Client
* Mapping Logic
* Synchronisation Service

Use:

* HttpClientFactory
* Dependency Injection

Handle failures gracefully.

Implement Upsert behaviour.

---

# SignalR Rules

When implementing real-time functionality:

Generate:

* Hub
* Broadcast Logic

Use SignalR for:

* Leaderboard Updates
* XP Updates
* Badge Unlock Notifications

SignalR logic belongs in Services.

---

# Error Handling Rules

Handle expected failures gracefully.

Examples:

* Not Found
* Validation Failure
* Unauthorized
* Forbidden
* External API Failure

Do not expose internal exception details.

---

# Task Resolution Rules

Determine the current task from roadmap.md.

Only generate files required by that task.

Do not implement future roadmap tasks.

Do not generate unrelated files.

---

# Output Expectations

Before generating code:

* Explain assumptions
* Explain design decisions

Generated code should be:

* Production-ready
* Testable
* Readable
* Maintainable

Never generate placeholder TODO implementations.
