# AI-Assisted Development

## Overview

AI tools were used during planning, implementation, testing, debugging, and documentation.

The project used an instruction-based AI workflow. Instead of relying mainly on one-off chat prompts, AI assistants were guided by Markdown instruction files:

- `specs/agent-instructions/copilot-instructions.md`
- `specs/agent-instructions/roadmap.md`
- `specs/agent-instructions/next-task.md`
- `specs/agent-instructions/skills/`

These files defined the project rules, current roadmap tasks, architecture expectations, and task-specific development standards.

---

## Human Review

AI output was reviewed before being accepted.

Suggestions and code changes were checked against:

- Assessment requirements
- Project scope
- Existing code structure
- Security requirements
- Testability
- Deployment constraints

AI was used as a development assistant, not as a replacement for understanding the implemented solution.

---

## Accepted, Modified, and Rejected Suggestions

Accepted examples:

- React and TypeScript frontend
- ASP.NET Core Web API backend
- Entity Framework Core with SQLite
- JWT authentication and refresh tokens
- Zustand state management
- SignalR notifications
- Serilog logging
- IMemoryCache caching
- Docker support

Modified examples:

- The project scope was narrowed from New Zealand trails to Christchurch trails.
- Daily streaks were changed to weekly streaks because hiking is not usually a daily activity.
- XP, levels, streaks, and leaderboard rank were designed as calculated values instead of duplicated stored values.

Rejected examples:

- Building a full game instead of a gamified web application
- Adding too many advanced features beyond the project timeline
- Using Swagger UI as the main API documentation, because the assessment requires Scalar API Documentation
- Accepting generated code without checking whether it matched the project structure

---

## Related Evidence

- `specs/ai-prompts.md`
- `specs/plan.md`
- `specs/system-design.md`
- `specs/agent-instructions/`
