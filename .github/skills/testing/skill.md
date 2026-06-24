# Testing Development Skill

## Purpose

Use this skill whenever implementing automated tests.

This skill is responsible for:

* Unit Tests
* Integration Tests
* Validation Tests
* UI Tests

This skill is NOT responsible for:

* Business Rules
* Database Design
* API Design
* Frontend Design

Those concerns belong to other skills.

---

# Testing Stack

## Backend

Use:

* xUnit
* Moq
* FluentAssertions

## Frontend

Use:

* Vitest
* React Testing Library

Do not introduce alternative testing frameworks.

---

# Testing Philosophy

Focus on:

* Business behaviour
* User outcomes
* Edge cases
* Error handling

Avoid:

* Testing framework internals
* Testing implementation details
* Coverage-only tests

Prefer meaningful tests over high coverage numbers.

---

# Backend Testing Rules

Generate tests for:

* Services
* Validators
* Authorization Rules
* Authentication Logic
* External Integrations

Avoid testing:

* EF Core internals
* ASP.NET Core framework behaviour
* Third-party library behaviour

Mock external dependencies.

Use Moq for:

* Services
* APIs
* SignalR
* Caching
* Logging

---

# Service Tests

Verify:

* Success scenarios
* Failure scenarios
* Edge cases

Use:

```csharp id="6gn2l6"
Arrange
Act
Assert
```

structure.

Example:

```text id="7i6cxt"
AuthenticationServiceTests
TrailServiceTests
CheckInServiceTests
LeaderboardServiceTests
```

---

# Validator Tests

Generate tests for all FluentValidation validators.

Verify:

* Required fields
* Invalid formats
* Length limits
* Business constraints

Examples:

```text id="87g6mg"
RegisterRequestValidatorTests
LoginRequestValidatorTests
CreateCheckInValidatorTests
```

---

# Authentication Tests

Verify:

## Registration

* Valid registration succeeds
* Duplicate email fails
* Invalid request fails

## Login

* Valid credentials succeed
* Invalid password fails
* Unknown email fails

## JWT

* Token generation succeeds
* Claims are generated correctly
* Expiration is configured correctly

## Google OAuth

* New user registration
* Existing user login
* Provider validation

---

# Authorization Tests

Verify role-based access.

Roles:

```text id="e3hh3z"
User
Moderator
Admin
```

Examples:

* User cannot access admin endpoints
* Moderator can access moderator features
* Admin can access all features

---

# Integration Tests

Generate integration tests only when explicitly required by the roadmap.

Examples:

* DOC API integration
* Authentication flow
* SignalR integration

Mock external services whenever possible.

Do not call live services.

---

# Logging Tests

Verify:

* Important events are logged
* Errors are logged

Mock ILogger.

Do not test logging framework internals.

---

# Caching Tests

Verify:

* Cache hit
* Cache miss
* Cache invalidation

Do not test IMemoryCache internals.

Test application behaviour only.

---

# SignalR Tests

Verify:

* Events are broadcast
* Correct payloads are sent
* Connection handling logic works

Mock SignalR dependencies.

---

# Frontend Testing Rules

Generate tests for:

* Pages
* Components
* Zustand Stores
* User Interactions

Avoid snapshot-heavy testing.

Prefer behaviour-based tests.

---

# Authentication UI Tests

Verify:

* Login form submission
* Register form submission
* Validation messages
* Authentication state changes

---

# Trail UI Tests

Verify:

* Trail list rendering
* Search behaviour
* Filter behaviour
* Loading states
* Empty states

---

# Check-In UI Tests

Verify:

* Form submission
* Validation errors
* Success feedback

---

# Dashboard UI Tests

Verify display of:

* XP
* Level
* Streak
* Statistics
* Badges

---

# Leaderboard UI Tests

Verify:

* Ranking display
* Sorting
* Real-time updates

---

# Theme Tests

Verify:

* Light mode
* Dark mode
* Theme persistence

---

# Zustand Store Tests

Verify:

* State updates
* Actions
* Derived values

Examples:

```text id="ppsmv7"
authStore
themeStore
```

---

# Task Resolution Rules

Determine the current task from roadmap.md.

Generate tests only for the current roadmap task.

Do not generate tests for future features.

Do not generate unrelated test files.

---

# Output Expectations

Use:

* Arrange / Act / Assert
* Descriptive test names
* Success scenarios
* Failure scenarios
* Edge cases

Generated tests should be:

* Production-ready
* Readable
* Maintainable

Focus on behaviour rather than implementation details.
