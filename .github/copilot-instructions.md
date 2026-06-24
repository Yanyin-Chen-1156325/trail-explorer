# Trail Explorer - Copilot Instructions

## Project Context

You are a senior full-stack software engineer.

Project:

Trail Explorer

Purpose:

A gamified hiking trail tracking application focused on Christchurch and Canterbury trails.

Users can:

* Register and login
* Login using Google OAuth
* Browse hiking trails
* Search and filter trails
* Record completed trails
* Earn XP
* Unlock badges
* Maintain streaks
* View leaderboards
* Track hiking progress

---

## Technology Stack

### Backend

* ASP.NET Core Web API (.NET 10)
* Entity Framework Core
* SQLite
* JWT Authentication
* Google OAuth
* BCrypt.Net
* FluentValidation
* SignalR
* Serilog
* IMemoryCache
* Scalar API

### Frontend

* React
* TypeScript
* Zustand
* Tailwind CSS
* Shadcn UI
* React Router

### Testing

* xUnit
* Moq
* Vitest
* React Testing Library

### DevOps

* Docker
* Docker Compose

---

## Architecture Rules

Use a Service Layer architecture.

Controllers must remain thin.

Business logic belongs in Services.

Database access should use Entity Framework Core.

Repository Pattern is NOT required.

Use Dependency Injection throughout the application.

Use async/await for all I/O operations.

Separate responsibilities clearly.

Follow SOLID principles.

---

## External Integrations

### DOC Public API

Trail data is synchronized from the New Zealand Department of Conservation API.

Requirements:

* Use HttpClient
* Create dedicated API client classes
* Use DTOs for external models
* Use BackgroundService for scheduled synchronization
* Use Upsert logic when synchronizing trails
* Implement fallback seed data if synchronization fails

---

## Database Rules

Use a normalized relational database design.

Do NOT create tables for:

* XP
* Level
* Streak
* Leaderboard

These values must be calculated dynamically from existing data.

Primary keys should use Guid.

Use foreign keys and navigation properties appropriately.

---

## Authentication & Security Requirements

Support:

* Email and Password Authentication
* Google OAuth Authentication

Implement:

* JWT Authentication
* Refresh Tokens
* Role-Based Authorization (RBAC)
* BCrypt Password Hashing
* FluentValidation
* Rate Limiting

Roles:

* User
* Moderator
* Admin

Security should be applied by default.

---

## Advanced Features

The project includes the following advanced features:

### State Management

Use Zustand for global application state.

### Theme Switching

Support:

* Light Mode
* Dark Mode

Persist theme preference locally.

### Real-Time Features

Use SignalR for:

* Real-time leaderboard updates
* Real-time ranking changes

### Logging

Use Serilog.

Log:

* User Registration
* User Login
* Trail Completion
* Badge Unlock
* DOC Synchronization Jobs
* Application Errors

### Caching

Use IMemoryCache for:

* Trail Lists
* Trail Details
* Leaderboard Data

### Docker

Provide:

* Backend Dockerfile
* Frontend Dockerfile
* docker-compose.yml

Application should be runnable using Docker Compose.

---

## Coding Standards

### C#

* Use nullable reference types
* Use DTOs
* Use FluentValidation
* Use PascalCase naming
* Use XML comments for public APIs
* Prefer constructor injection
* Keep methods small and focused

### TypeScript

* Use functional components
* Use hooks
* Use strict typing
* Use Zustand stores
* Use camelCase naming
* Create reusable UI components

---

## Testing Rules

All business logic requires automated tests.

Backend:

* xUnit
* Moq

Frontend:

* Vitest
* React Testing Library

Required test coverage:

* Authentication
* Authorization
* Trail Search
* Trail Filtering
* Trail Check-In
* XP Calculation
* Level Calculation
* Badge Unlock Logic
* Leaderboard Ranking

---

## API Design Rules

Follow RESTful conventions.

Use DTOs for requests and responses.

Validate all incoming requests.

Return appropriate HTTP status codes.

Support:

* Searching
* Filtering
* Pagination

Implement caching where beneficial.

---

## AI Behaviour

Generate production-ready code.

Never generate placeholder TODO code.

Explain assumptions before generating code.

When implementing a feature generate:

1. Entity
2. DTOs
3. Service Interface
4. Service Implementation
5. Controller
6. Validation
7. Unit Tests

When applicable also generate:

8. SignalR Integration
9. Caching Logic
10. Logging
11. Docker Configuration

Always align generated code with the Trail Explorer architecture and database design.
