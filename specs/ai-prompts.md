# AI Prompts

## Purpose

This file records how AI was prompted during the development of Trail Explorer.

The project did not rely mainly on one-off prompts such as "build this backend feature" or "build this frontend page". Instead, AI was guided through structured instruction files and skill files. During development, the AI assistant was asked to read those files first, identify the current roadmap task, load the relevant skill instructions, and then implement only that task.

This approach made the AI workflow more consistent and kept generated work aligned with the project architecture.

---

## Main Development Prompt

The main recurring development prompt was:

```text
Read the project instructions and roadmap.

Determine the first incomplete task.

Identify the task category.

Load the relevant skill files.

Explain the implementation plan before modifying files.

After approval, implement only the current task and keep the project buildable.
```

This prompt was supported by:

- `specs/agent-instructions/copilot-instructions.md`
- `specs/agent-instructions/roadmap.md`
- `specs/agent-instructions/next-task.md`
- `specs/agent-instructions/skills/backend/skill.md`
- `specs/agent-instructions/skills/database/skill.md`
- `specs/agent-instructions/skills/frontend/skill.md`
- `specs/agent-instructions/skills/gamification/skill.md`
- `specs/agent-instructions/skills/testing/skill.md`

---

## Task Selection Prompt

Prompt:

```text
Read the roadmap and determine the first incomplete task.

Do not modify files yet.

Output:
- Current task
- Task category
- Relevant skill files
- Files to create
- Files to modify
- Implementation plan
- Risks or dependencies

Wait for approval before implementation.
```

Purpose:

- Prevent the AI assistant from implementing unrelated future work
- Keep each development step scoped to the roadmap
- Make implementation decisions visible before code changes

Related file:

- `specs/agent-instructions/next-task.md`

---

## Project-Wide Instruction Prompt

Prompt source:

- `specs/agent-instructions/copilot-instructions.md`

This file instructed the AI assistant to follow the Trail Explorer architecture and workflow rules.

Key instructions included:

- Use React, TypeScript, ASP.NET Core, Entity Framework Core, and SQLite
- Use service layer architecture
- Keep controllers thin
- Put business logic in services
- Use dependency injection
- Use async/await for I/O operations
- Keep the project buildable
- Do not create placeholder implementations
- Do not implement multiple roadmap tasks in one execution

Purpose:

- Keep AI-generated code consistent across the project
- Avoid broad or unrelated changes
- Make the AI follow the same architecture rules throughout development

---

## Backend Skill Prompt

Prompt source:

- `specs/agent-instructions/skills/backend/skill.md`

This skill file was used when the current roadmap task involved backend work.

It instructed the AI assistant to follow rules for:

- API endpoints
- DTOs
- Services
- Validation
- Authentication
- Authorization
- Dependency injection
- Caching
- Logging
- External integrations

Purpose:

- Keep backend business logic in services
- Keep controllers focused on HTTP requests and responses
- Avoid exposing EF Core entities directly
- Use DTOs, validation, and dependency injection consistently

---

## Database Skill Prompt

Prompt source:

- `specs/agent-instructions/skills/database/skill.md`

This skill file was used when the current roadmap task involved database work.

It guided the AI assistant on:

- Entity definitions
- Entity relationships
- DbContext configuration
- EF Core table configuration
- Migrations
- Stored values versus calculated values

Purpose:

- Keep database changes scoped to the current roadmap task
- Avoid creating future entities too early
- Keep the schema aligned with the gamification model

---

## Frontend Skill Prompt

Prompt source:

- `specs/agent-instructions/skills/frontend/skill.md`

This skill file was used when the current roadmap task involved frontend work.

It guided the AI assistant on:

- React pages
- Components
- Zustand stores
- Routing
- API client usage
- Theme switching
- Loading, empty, and error states
- Responsive UI behaviour

Purpose:

- Keep frontend implementation consistent
- Ensure UI work matched the current feature
- Avoid adding unrelated screens or future functionality

---

## Gamification Skill Prompt

Prompt source:

- `specs/agent-instructions/skills/gamification/skill.md`

This skill file was used for XP, levels, streaks, badges, leaderboards, and dashboard statistics.

It guided the AI assistant on:

- XP calculation
- Level calculation
- Badge unlock rules
- Weekly streak logic
- Leaderboard ranking rules
- Dashboard progress data

Purpose:

- Keep gamification rules consistent across backend, frontend, and tests
- Avoid storing duplicated calculated values when they could be derived from user activity

---

## Testing Skill Prompt

Prompt source:

- `specs/agent-instructions/skills/testing/skill.md`

This skill file was used when writing or updating tests.

It guided the AI assistant on:

- Backend unit tests
- Frontend unit tests
- Integration tests
- Validation tests
- Edge cases
- Regression coverage after bug fixes

Purpose:

- Keep testing aligned with implemented functionality
- Check important business rules such as authentication, ownership, XP calculation, achievements, and leaderboard ordering

---

## Summary

The main AI prompt strategy was instruction-based rather than chat-based.

The important AI evidence is therefore the set of instruction, roadmap, and skill files used to guide development:

- `specs/agent-instructions/copilot-instructions.md`
- `specs/agent-instructions/roadmap.md`
- `specs/agent-instructions/next-task.md`
- `specs/agent-instructions/skills/`

These files show the prompts and context that the AI assistant used during development.
