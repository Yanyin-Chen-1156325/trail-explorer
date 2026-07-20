# System Design

## Application Overview

Trail Explorer is a full-stack gamified hiking platform for Christchurch trail users.

The system allows users to browse trails, complete trail check-ins, earn XP, unlock achievements, maintain weekly streaks, and compare progress through a leaderboard.

---

## Architecture

The application uses a React frontend and an ASP.NET Core Web API backend.

Frontend:

- React
- TypeScript
- React Router
- Zustand
- Tailwind CSS
- SignalR Client

Backend:

- ASP.NET Core Web API
- Entity Framework Core
- SQLite
- JWT Authentication
- SignalR
- Serilog
- IMemoryCache

Database:

- SQLite

External Services:

- DOC API
- Google OAuth

---

## Frontend Design

The frontend is organised around user workflows:

- Trail discovery
- Trail details
- Check-in submission
- Dashboard
- Leaderboard
- Achievements
- Profile and authentication

Zustand is used for client-side state where shared state is needed, such as authentication, theme preferences, and user progress data.

React Router is used to separate public, authenticated, and admin-facing pages.

---

## Backend Design

The backend exposes REST API endpoints for authentication, trails, check-ins, achievements, notifications, and leaderboard data.

Entity Framework Core is used for database access.

Business logic is kept in services rather than controllers so that controllers remain focused on HTTP request and response handling.

---

## Data Model

Main entities:

- User
- Trail
- CheckIn
- Achievement
- UserAchievement
- Notification
- RefreshToken

Computed values:

- XP
- Level
- Weekly streak
- Leaderboard rank

These values are calculated from user activity instead of being stored directly where possible.

---

## Gamification Design

Gamification is based on:

- XP rewards
- Levels
- Achievement badges
- Weekly streaks
- Leaderboards
- Real-time notifications

XP is calculated using trail distance and difficulty.

Levels are derived from total XP.

Achievements are unlocked when users reach milestones such as first trail completed, distance totals, or streak milestones.

---

## Security Design

The system includes several security measures:

- JWT authentication
- Refresh tokens
- BCrypt password hashing
- Role-based authorization
- Input validation with FluentValidation
- Rate limiting

Authentication protects user-specific features such as check-ins, profile data, notifications, and achievements.

---

## Real-Time Design

SignalR is used for real-time updates.

Events include:

- Leaderboard changes
- Badge unlock notifications
- XP gain notifications
- Level-up notifications
- Weekly streak notifications

This supports the gamification theme by giving users immediate feedback after completing trails.

---

## Caching Design

IMemoryCache is used for data that does not need to be fetched from the database or DOC API on every request.

Cached data includes:

- Trail lists
- Trail details
- Leaderboard results

This improves response time and reduces repeated external API calls.

---

## Logging Design

Serilog is used for structured backend logging.

Logged events include:

- Authentication events
- Trail check-ins
- Achievement unlocks
- DOC synchronisation
- Backend errors

Logs are used for debugging and monitoring application behaviour.

---

## Deployment Design

The application is designed for separate frontend and backend deployment.

Docker support is included for local development and deployment consistency.

The repository includes:

- Backend Dockerfile
- Frontend Dockerfile
- docker-compose.yml

---

## Key Design Decisions

### Christchurch-focused scope

The project focuses on Christchurch trails instead of all New Zealand trails to keep the application realistic and achievable.

### Dynamic gamification values

XP, levels, streaks, and leaderboard rankings are calculated from activity data rather than stored directly.

This avoids duplicated state and keeps rankings consistent.

### Weekly streaks instead of daily streaks

Weekly streaks are more suitable for hiking because users are unlikely to complete trails every day.

### SignalR for gamification feedback

Real-time notifications make achievements and leaderboard changes feel immediate.

### SQLite for project scope

SQLite is used because it is simple to configure, easy to deploy for assessment, and suitable for the expected project scale.