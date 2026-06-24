# Frontend Development Skill

## Purpose

Use this skill whenever implementing frontend functionality.

This skill is responsible for:

* React Pages
* React Components
* Zustand Stores
* API Integration
* Routing
* Theme Switching
* Responsive Design
* User Experience

This skill is NOT responsible for:

* Entity Definitions
* Database Design
* Business Rules
* XP Calculations
* Level Calculations
* Badge Logic

Those concerns belong to Database Skill and Gamification Skill.

---

# Technology Stack

Use:

* React
* TypeScript
* React Router
* Zustand
* Tailwind CSS
* Shadcn UI

Do not introduce additional frameworks unless explicitly requested.

---

# Folder Structure

Frontend code should use a feature-based structure.

Example:

```text id="o8iy4d"
src/

features/

  auth/
  trails/
  checkins/
  dashboard/
  badges/
  leaderboard/

shared/

  components/
  layouts/
  hooks/
  lib/
  types/
```

Each feature may contain:

```text id="um0l3z"
pages/
components/
services/
hooks/
types/
```

Keep related files together.

---

# Component Rules

Use functional components only.

Use React Hooks.

Do not use class components.

Components should:

* Have a single responsibility
* Remain reusable
* Remain focused

Prefer composition over large components.

Avoid deeply nested component trees.

---

# TypeScript Rules

Use strict typing.

Create dedicated interfaces and types.

Avoid:

```typescript
any
```

Avoid unsafe type assertions.

Prefer explicit types.

All API responses should be strongly typed.

---

# State Management Rules

Use Zustand for global state.

Examples:

```text id="xtqlww"
Authentication
Theme
User Profile
```

Do not use Redux.

Do not use Context API for global application state unless explicitly required.

Store logic should remain simple and focused.

---

# API Integration Rules

Create dedicated API service files.

Examples:

```text id="7k1wlu"
authApi.ts
trailApi.ts
checkInApi.ts
dashboardApi.ts
leaderboardApi.ts
```

Do not place fetch logic directly inside pages or components.

Use typed request and response models.

Handle:

* Loading
* Error
* Success

states consistently.

---

# Routing Rules

Use React Router.

Separate:

## Public Routes

Examples:

```text id="zkl7dd"
/
/login
/register
```

## Protected Routes

Examples:

```text id="s1if4o"
/dashboard
/trails
/checkins
/badges
/leaderboard
```

Generate ProtectedRoute components when authentication is required.

---

# Authentication UI Rules

Generate:

* Login Page
* Register Page
* Google Login Button

Store authentication state using Zustand.

Support:

* Login
* Logout
* Token Refresh
* Authentication Persistence

Handle expired sessions gracefully.

---

# Shadcn UI Rules

Use Shadcn UI as the primary component library.

Examples:

```text id="pdjlwm"
Button
Card
Dialog
DropdownMenu
Sheet
Tabs
Toast
```

Avoid creating custom components when an appropriate Shadcn component already exists.

---

# Tailwind Rules

Use Tailwind utilities for styling.

Avoid inline styles.

Prefer utility classes.

Keep styling consistent throughout the application.

---

# Responsive Design Rules

Support:

* Mobile
* Tablet
* Desktop

Pages should remain usable on small screens.

Use responsive Tailwind utilities.

Examples:

```text id="k5q4t0"
sm:
md:
lg:
xl:
```

---

# Theme Rules

Support:

* Light Theme
* Dark Theme

Requirements:

* Use Tailwind Dark Mode
* Persist preference in localStorage
* Apply theme on application startup

Generate:

```text id="i8r6e6"
themeStore.ts
ThemeToggle.tsx
```

---

# User Experience Rules

Always provide:

## Loading States

Examples:

* Skeletons
* Loading Indicators

## Error States

Examples:

* Error Messages
* Retry Actions

## Empty States

Examples:

* No Trails Found
* No Check-Ins Yet
* No Badges Unlocked

## Success Feedback

Examples:

* Toast Notifications
* Success Messages

Never leave users without feedback.

---

# Feature-Specific Components

## Trail Discovery

Examples:

```text id="jvlyl0"
TrailCard
TrailSearchBar
DifficultyFilter
TrailList
```

## Check-In System

Examples:

```text id="65fqce"
CheckInForm
CheckInHistory
CheckInCard
```

## Dashboard

Examples:

```text id="6v1t34"
StatisticsCard
ProgressWidget
DashboardSummary
```

## Achievement System

Examples:

```text id="8v8v9o"
BadgeCard
BadgeWall
BadgeUnlockModal
```

## Leaderboard

Examples:

```text id="0dz1ga"
LeaderboardTable
LeaderboardRow
RankBadge
```

---

# SignalR Rules

When implementing real-time functionality:

Generate:

```text id="26qjhk"
signalrClient.ts
```

Support:

* Connection Management
* Reconnection Handling
* Event Subscriptions

Use SignalR for:

* Leaderboard Updates
* XP Updates
* Badge Notifications

---

# Testing Rules

Frontend tests belong to Testing Skill.

Do not generate tests unless the roadmap task is a Testing task.

---

# Task Resolution Rules

Determine the current task from roadmap.md.

Generate only files required by that task.

Do not implement future roadmap tasks.

Do not generate unrelated pages, components, stores, or services.

---

# Output Expectations

Before generating code:

* Explain assumptions
* Explain design decisions

Generated code should be:

* Production-ready
* Readable
* Reusable
* Maintainable

Never generate placeholder TODO implementations.
