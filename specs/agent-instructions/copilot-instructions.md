# Trail Explorer - Copilot Instructions

## Project Overview

You are a senior full-stack software engineer.

Project Name:

Trail Explorer

Project Type:

Gamified hiking trail tracking application.

Primary Goal:

Allow users to discover hiking trails, record trail completions, earn achievements, gain experience points, and track progress through a gamified experience.

---

# Technology Stack

## Backend

* ASP.NET Core Web API (.NET 10)
* Entity Framework Core
* SQLite

## Frontend

* React
* TypeScript
* React Router
* Zustand
* Tailwind CSS
* Shadcn UI

## Authentication

* JWT Authentication
* Refresh Tokens
* Google OAuth
* BCrypt Password Hashing

## Testing

* xUnit
* Moq
* Vitest
* React Testing Library

## Infrastructure

* SignalR
* Serilog
* IMemoryCache
* Docker
* Docker Compose

---

# Architecture Rules

Use Service Layer Architecture.

Controllers must remain thin.

Business logic belongs in Services.

Use Entity Framework Core directly.

Repository Pattern is NOT required.

Use Dependency Injection throughout the application.

Use async/await for all I/O operations.

Follow SOLID principles.

Keep code production-ready.

Do not generate placeholder implementations.

---

# Development Workflow

Before implementing any task:

1. Read roadmap.md
2. Determine the first incomplete task
3. Identify the task category
4. Load the required skill files
5. Explain the implementation plan
6. Wait for approval before modifying files

Never implement multiple roadmap tasks in a single execution.

Implement only the current task.

---

# Skill Selection Rules

Determine the task category from roadmap.md.

## Database Tasks

Examples:

* Create Entity
* Configure Table
* Configure Relationships

Load:

.github/skills/database/skill.md

---

## Backend Tasks

Examples:

* API Endpoints
* Services
* DTOs
* Validation
* Authentication
* Authorization
* Caching
* Logging

Load:

.github/skills/backend/skill.md

---

## Frontend Tasks

Examples:

* Pages
* Components
* Zustand Stores
* Routing
* Theme Switching
* API Integration

Load:

.github/skills/frontend/skill.md

---

## Gamification Tasks

Examples:

* XP
* Levels
* Streaks
* Badges
* Leaderboards
* Dashboard Statistics

Load:

.github/skills/gamification/skill.md

---

## Testing Tasks

Examples:

* Unit Tests
* Integration Tests
* Validation Tests
* UI Tests

Load:

.github/skills/testing/skill.md

---

# Priority Rules

When multiple files contain rules:

1. roadmap.md
   Defines what to build.

2. skill.md files
   Define how to build it.

3. copilot-instructions.md
   Defines project-wide architecture rules.

If rules conflict:

Skill files take precedence for implementation details.

---

# Important Restrictions

Do not create future entities.

Do not create future relationships.

Do not infer requirements from future epics.

Do not generate files outside the current task scope.

Do not modify roadmap.md automatically.

Only suggest roadmap updates after successful implementation.

Always keep the project buildable.

Prefer small incremental changes and small commits.
