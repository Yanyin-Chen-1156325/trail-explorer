# Testing Development Skill

## Purpose

Use this skill whenever generating automated tests for Trail Explorer.

The goal is to verify:

* Business Rules
* Validation Rules
* Security Rules
* API Behavior
* User Interactions
* Gamification Logic

Always prioritize meaningful tests over simple code coverage.

---

## Testing Stack

### Backend

Use:

* xUnit
* Moq
* FluentAssertions

### Frontend

Use:

* Vitest
* React Testing Library

Do not introduce alternative testing frameworks unless explicitly requested.

---

# Testing Philosophy

Focus on:

* Business behavior
* Edge cases
* User outcomes

Avoid testing implementation details.

Do not test framework internals.

---

# Backend Testing Rules

Generate tests for:

* Services
* Validators
* Business Rules

Avoid testing:

* EF Core internals
* ASP.NET Core framework behavior

Mock external dependencies.

Use Moq for:

* Repositories
* External APIs
* Services
* SignalR

---

# Authentication Tests

Generate tests for:

## Registration

Verify:

* Valid registration succeeds
* Duplicate email fails
* Invalid input fails

## Login

Verify:

* Correct credentials succeed
* Invalid password fails
* Unknown email fails

## JWT

Verify:

* Token generation
* Expiration handling
* Claims creation

## OAuth

Verify:

* New Google user registration
* Existing user login
* Provider validation

---

# Authorization Tests

Verify:

* User access rules
* Moderator access rules
* Admin access rules

Examples:

User:

* Cannot access admin endpoints

Moderator:

* Can manage trails

Admin:

* Can perform administrative actions

---

# Validation Tests

Generate tests for all FluentValidation validators.

Verify:

* Required fields
* Invalid formats
* Length limits
* Business constraints

Examples:

* Email validation
* Password validation
* CheckIn validation

---

# DOC API Integration Tests

Verify:

* Successful synchronization
* Mapping correctness
* API failure handling
* Retry behavior
* Upsert behavior

Mock all external API calls.

Do not call live services.

---

# Caching Tests

Verify:

* Cache hit behavior
* Cache miss behavior
* Cache invalidation

Examples:

* Trail List Cache
* Trail Detail Cache
* Leaderboard Cache

---

# Logging Tests

Verify:

* Important events are logged
* Errors are logged appropriately

Do not test Serilog internals.

Mock ILogger dependencies.

---

# Gamification Tests

Gamification is a critical project area.

Generate comprehensive tests.

---

## XP Calculation Tests

Verify:

Easy Trail

Distance = 5km

Expected XP = 50

Intermediate Trail

Distance = 10km

Expected XP = 120

Advanced Trail

Distance = 12km

Expected XP = 180

Expert Trail

Distance = 20km

Expected XP = 400

Verify edge cases.

---

## Level Calculation Tests

Verify:

* Level thresholds
* Boundary values
* Exact XP transitions

Examples:

499 XP

Level 1

500 XP

Level 2

---

## Weekly Streak Tests

Verify:

* Consecutive weeks
* Missing week
* Multiple check-ins in same week

Examples:

Week 1 ✓

Week 2 ✓

Week 3 ✓

Current Streak = 3

Missing Week:

Week 3 ✗

Streak resets

---

## Badge Tests

Verify:

### Completion Badges

* First Trail
* 10 Trails
* 25 Trails
* 50 Trails

### Distance Badges

* 50km
* 100km
* 250km

### Region Badges

* Port Hills Explorer
* Canterbury Explorer

### Difficulty Badges

* First Advanced Trail
* First Expert Trail

### Streak Badges

* 2 Week Streak
* 4 Week Streak

Verify badges are only awarded once.

---

## Leaderboard Tests

Verify ranking order.

Sort by:

1. XP
2. Completed Trails
3. Distance

Verify tie-breaking behavior.

---

# SignalR Tests

Verify:

* Connection establishment
* Message broadcasting
* Leaderboard updates
* XP updates
* Badge unlock notifications

Mock SignalR dependencies where possible.

---

# Frontend Testing Rules

Generate tests for:

* Components
* Stores
* User interactions

Avoid snapshot-heavy testing.

Prefer behavior-based tests.

---

# Authentication UI Tests

Verify:

* Login form
* Register form
* Validation messages
* Authentication state updates

---

# Trail UI Tests

Verify:

* Trail list rendering
* Search functionality
* Filter functionality
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
* Weekly Streak
* Badges
* Statistics

---

# Leaderboard UI Tests

Verify:

* Ranking display
* Real-time updates
* Sorting behavior

---

# Theme Switching Tests

Verify:

* Light Mode
* Dark Mode
* Theme persistence

---

# Zustand Store Tests

Verify:

* State updates
* Actions
* Derived values

Examples:

* Authentication Store
* Theme Store

---

# Output Expectations

When generating tests:

* Use Arrange / Act / Assert structure
* Use descriptive test names
* Test both success and failure scenarios
* Include edge cases

Generate production-quality tests.

Avoid meaningless coverage-only tests.

Focus on validating business behavior.
