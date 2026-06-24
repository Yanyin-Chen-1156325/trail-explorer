# Frontend Development Skill

## Purpose

Use this skill whenever implementing frontend functionality for Trail Explorer.

This skill focuses on:

* React pages
* Components
* State management
* API integration
* User experience
* Responsive design

Always follow the rules defined in `copilot-instructions.md`.

---

## Technology Requirements

Use:

* React
* TypeScript
* React Router
* Zustand
* Tailwind CSS
* Shadcn UI

Do not introduce alternative frameworks unless explicitly requested.

---

## Folder Structure

Use a feature-based folder structure.

Example:

src/

features/

* auth/
* trails/
* checkins/
* dashboard/
* badges/
* leaderboard/

shared/

* components/
* layouts/
* hooks/
* lib/
* types/

Each feature should contain:

* pages
* components
* services
* hooks
* types

Keep related files together.

---

## Component Rules

Use functional components only.

Use hooks instead of class components.

Components should:

* Have a single responsibility
* Be reusable
* Remain small and focused

Prefer composition over large components.

---

## State Management Rules

Use Zustand for global state.

Examples:

* Authentication
* User Profile
* Theme Preferences

Do not use Redux.

Do not place global state inside React Context unless specifically required.

---

## API Integration Rules

Create dedicated API service files.

Example:

authApi.ts

trailApi.ts

checkInApi.ts

dashboardApi.ts

Do not place fetch logic directly inside components.

Use typed request and response models.

Handle:

* Loading
* Error
* Success

states appropriately.

---

## Routing Rules

Use React Router.

Protect authenticated routes.

Examples:

Public Routes

* Login
* Register

Protected Routes

* Dashboard
* Trails
* CheckIns
* Badges
* Leaderboard

Generate ProtectedRoute components when required.

---

## UI Component Rules

Use Shadcn UI as the primary component library.

Use Tailwind CSS for styling.

Create reusable components where appropriate.

Examples:

* TrailCard
* BadgeCard
* StatCard
* LeaderboardTable
* XpProgressBar

Avoid duplicating UI patterns.

---

## Theme Switching

Support:

* Light Theme
* Dark Theme

Requirements:

* Use Tailwind Dark Mode
* Persist preference in localStorage
* Apply theme on application startup

Generate:

* Theme Store
* Theme Toggle Component

---

## Responsive Design Rules

Support:

* Mobile
* Tablet
* Desktop

Use responsive Tailwind utilities.

Pages should remain usable on small screens.

Leaderboard and Dashboard must be mobile-friendly.

---

## User Experience Rules

Always provide:

### Loading State

Examples:

* Skeletons
* Loading Indicators

### Error State

Examples:

* Error Messages
* Retry Actions

### Empty State

Examples:

* No Trails Found
* No CheckIns Yet
* No Badges Unlocked

### Success Feedback

Examples:

* Toast Notifications
* Success Messages

---

## Authentication UI Rules

Generate:

* Login Page
* Register Page
* Google Login Button

Support:

* JWT Authentication
* Google OAuth

Store authentication state in Zustand.

Handle:

* Login
* Logout
* Token Expiration

---

## Dashboard Rules

Display:

* Current Level
* Total XP
* Weekly Streak
* Completed Trails
* Total Distance
* Unlocked Badges
* Leaderboard Rank

Dashboard data should come from backend APIs.

Avoid duplicating calculation logic in the frontend.

---

## Leaderboard Rules

Display:

* Rank
* User
* XP
* Completed Trails
* Distance

Support real-time updates via SignalR.

Update UI without page refresh.

---

## SignalR Rules

Generate:

* SignalR Client
* Connection Management
* Reconnection Handling

Use SignalR for:

* Leaderboard Updates
* Badge Unlock Notifications
* XP Updates

---

## TypeScript Rules

Use strict typing.

Avoid:

* any
* unknown workarounds

Create dedicated types and interfaces.

Prefer type safety throughout the application.

---

## Testing Rules

Use:

* Vitest
* React Testing Library

Generate tests for:

* Components
* Hooks
* Zustand Stores
* User Interactions

Focus on behavior rather than implementation details.

---

## Output Expectations

When implementing a frontend feature generate:

1. Page Component
2. Child Components
3. Zustand Store (if required)
4. API Service
5. Types
6. Unit Tests

When applicable also generate:

7. Theme Integration
8. SignalR Integration
9. Loading / Error / Empty States

Generate production-ready React code.

Never generate placeholder TODO implementations.

Keep UI consistent with the Trail Explorer design system.
