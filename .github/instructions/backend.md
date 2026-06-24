# Backend Development Skill

## Purpose

Use this skill whenever implementing backend functionality for Trail Explorer.

This skill focuses on:

* API development
* Domain logic
* Database access
* Validation
* Authentication
* Integration services

Always follow the rules defined in `copilot-instructions.md`.

---

## Backend Feature Checklist

When implementing a backend feature generate:

1. Entity (if required)
2. DTOs
3. Service Interface
4. Service Implementation
5. Controller
6. Validation
7. Dependency Injection Registration
8. Unit Tests

Generate all required files unless explicitly instructed otherwise.

---

## Entity Rules

Entities should:

* Use Guid primary keys
* Use navigation properties
* Use nullable reference types
* Contain only domain data

Do not place business logic inside entities.

Example:

* User
* Trail
* CheckIn
* Badge
* RefreshToken

---

## DTO Rules

Use DTOs for all API requests and responses.

Never expose EF Core entities directly.

Generate:

* Request DTOs
* Response DTOs

Separate create/update requests from response models.

---

## Service Rules

Business logic belongs in Services.

Services should:

* Be focused on a single responsibility
* Be testable
* Use dependency injection

Examples:

* AuthenticationService
* TrailService
* CheckInService
* DashboardService

Avoid placing business logic in Controllers.

---

## Controller Rules

Controllers should remain thin.

Controllers may:

* Receive requests
* Validate input
* Call services
* Return HTTP responses

Controllers should not:

* Query DbContext directly
* Perform calculations
* Contain business rules

---

## Validation Rules

Use FluentValidation.

Generate validators for:

* Create requests
* Update requests
* Authentication requests

Validate:

* Required fields
* Length limits
* Email formats
* Business constraints

---

## Database Rules

Use Entity Framework Core.

Use:

* DbContext
* LINQ
* Async queries

Repository Pattern is NOT required.

Prefer direct use of DbContext inside Services.

Always use:

* AsNoTracking() for read-only queries
* CancellationToken when appropriate

---

## API Design Rules

Follow REST conventions.

Examples:

GET

/api/trails

/api/trails/{id}

POST

/api/checkins

/api/auth/login

PUT

/api/checkins/{id}

DELETE

/api/checkins/{id}

Use appropriate HTTP status codes.

Return ProblemDetails for errors when appropriate.

---

## Authentication Rules

Support:

* Email and Password Authentication
* Google OAuth

Generate:

* Register Endpoint
* Login Endpoint
* Refresh Token Endpoint
* Logout Endpoint
* Google OAuth Endpoint

Use:

* JWT
* Refresh Tokens
* BCrypt Password Hashing

Never store plain text passwords.

---

## Authorization Rules

Use Role-Based Authorization.

Roles:

* User
* Moderator
* Admin

Protect endpoints using Authorize attributes.

Example:

* Admin-only operations
* Moderator trail management

---

## DOC API Integration Rules

When working with DOC synchronization:

Generate:

* API Client
* DTO Models
* Mapping Logic
* Synchronization Service

Requirements:

* Use HttpClientFactory
* Handle API failures gracefully
* Implement retry logic when appropriate
* Use Upsert synchronization

---

## Logging Rules

Use structured logging.

Log:

* User Registration
* User Login
* Trail Completion
* Badge Unlock
* Synchronization Jobs
* Errors

Use ILogger abstraction.

Do not use Console.WriteLine.

---

## Caching Rules

Use IMemoryCache when beneficial.

Cache:

* Trail Lists
* Trail Details
* Leaderboards

Invalidate cache when relevant data changes.

---

## SignalR Rules

When implementing real-time features:

Generate:

* Hub
* Hub Interface (if needed)
* Broadcast Logic

Use SignalR for:

* Leaderboard Updates
* Ranking Changes

---

## Error Handling Rules

Handle expected failures gracefully.

Examples:

* Not Found
* Validation Failure
* Unauthorized Access
* External API Failure

Avoid exposing internal exception details.

---

## Testing Rules

Generate xUnit tests.

Use:

* Moq
* FluentAssertions

Test:

* Business Rules
* Validation Rules
* Service Logic
* Error Handling

Do not test EF Core internals.

Mock external dependencies.

---

## Output Expectations

Generated backend code should be:

* Production-ready
* Readable
* Testable
* Maintainable

Always explain major design decisions before generating code.

Never generate placeholder TODO implementations.
