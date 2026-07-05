# Frontend Development Skill

## Purpose

Use this skill whenever implementing frontend functionality.

This skill is responsible for:

- React Pages
- React Components
- Zustand Stores
- API Integration
- Routing
- Theme Switching
- Responsive Design
- User Experience

This skill is NOT responsible for:

- Entity Definitions
- Database Design
- Business Rules
- XP Calculations
- Level Calculations
- Badge Logic

Those concerns belong to backend and domain-specific skills.

---

# Technology Stack

Use:

- React
- TypeScript
- React Router
- Zustand
- Tailwind CSS
- Shadcn UI

Do not introduce additional frameworks unless explicitly requested.

---

# Folder Structure

Frontend code should use a feature-based structure.

Example:

```text
src/
├─ features/
│  ├─ auth/
│  ├─ home/
│  ├─ dashboard/
│  ├─ trails/
│  ├─ checkins/
│  ├─ badges/
│  └─ leaderboard/
│
├─ shared/
│  ├─ components/
│  ├─ layouts/
│  ├─ hooks/
│  ├─ lib/
│  └─ types/
```

Each feature may contain:

```text
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

- Have a single responsibility
- Remain reusable
- Remain focused

Prefer composition over inheritance.

Avoid deeply nested component trees.

Avoid monolithic components.

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

All API requests and responses should be strongly typed.

---

# State Management Rules

Use Zustand for global state.

Examples:

```text
Authentication
Theme
User Profile
```

Do not use Redux.

Do not use Context API for application-wide state unless explicitly required.

Store logic should remain simple and focused.

---

# API Integration Rules

Create dedicated API service files.

Examples:

```text
authApi.ts
trailApi.ts
checkInApi.ts
dashboardApi.ts
leaderboardApi.ts
```

Do not place API calls directly inside pages.

Use typed request and response models.

Handle:

- Loading
- Error
- Success

states consistently.

---

# Routing Rules

Use React Router.

## Public Routes

Examples:

```text
/
/login
/register
```

## Protected Routes

Examples:

```text
/dashboard
/trails
/checkins
/badges
/leaderboard
/profile
```

Generate ProtectedRoute components when authentication is required.

---

# Public Layout Rules

All public pages should use a shared layout.

Examples:

- Homepage
- Login
- Register
- Forgot Password

Requirements:

- Reuse PublicLayout
- Reuse SiteHeader
- Reuse SiteFooter
- Maintain visual consistency
- Support responsive design

Generate:

```text
PublicLayout.tsx
SiteHeader.tsx
SiteFooter.tsx
```

---

# Header Rules

Desktop:

- Display logo
- Display navigation links
- Display theme toggle
- Display authentication actions

Mobile:

- Hide desktop navigation
- Display hamburger menu
- Use Shadcn Sheet component
- Display navigation inside drawer

Requirements:

- Sticky header preferred
- Keyboard accessible
- Support dark mode
- Support light mode

Navigation should collapse below lg breakpoint.

---

# Footer Rules

Footer should:

- Display branding
- Display navigation links
- Display legal links
- Display social links when available

Requirements:

- Responsive layout
- Consistent spacing
- Theme consistency

---

# Authentication UI Rules

Generate:

- Login Page
- Register Page
- Google Login Button

Store authentication state using Zustand.

Support:

- Login
- Logout
- Token Refresh
- Authentication Persistence

Handle expired sessions gracefully.

---

# Authentication Page Rules

Login Page should include:

- Email
- Password
- Login Button
- Google Login Button
- Link to Register

Register Page should include:

- Name
- Email
- Password
- Confirm Password
- Create Account Button
- Google Login Button
- Link to Login

Requirements:

- Use PublicLayout
- Use Shadcn Form components
- Center the form card
- Support validation
- Support loading state
- Support error state
- Support success feedback

---

# Homepage Rules

Homepage should introduce Trail Explorer as a hiking and gamification platform.

Goals:

- Explain product value quickly
- Encourage trail exploration
- Encourage account creation
- Highlight progression and achievements
- Feel like a production-ready SaaS product

Homepage may include:

- Hero Section
- Feature Section
- Featured Trails Section
- Progress Preview Section
- CTA Section

Avoid:

- Generic CRUD layouts
- Enterprise dashboard appearance
- Text-heavy marketing pages

Homepage structure should remain modular.

---

# Shadcn UI Rules

Use Shadcn UI as the primary component library.

Prefer:

- Button
- Card
- Dialog
- DropdownMenu
- Sheet
- Tabs
- Toast
- Form
- Input

Avoid creating custom components when Shadcn already provides a suitable solution.

---

# Tailwind Rules

Use Tailwind utility classes.

Avoid inline styles.

Prefer utility-first styling.

Keep spacing and typography consistent.

---

# Theme Strategy

Default Theme:

- Dark Mode

Optional Theme:

- Light Mode

Dark Mode is the primary user experience.

Avoid white backgrounds as the primary application theme.

---

# Color Palette

Background

```text
#0F172A
```

Surface

```text
#1E293B
```

Primary

```text
#10B981
```

Secondary

```text
#22C55E
```

XP

```text
#F59E0B
```

Badge

```text
#8B5CF6
```

Danger

```text
#EF4444
```

Text Primary

```text
#F8FAFC
```

Text Secondary

```text
#94A3B8
```

---

# Navigation Strategy

## Public Pages

Desktop:

- Top Header Navigation

Mobile:

- Hamburger Navigation Drawer

## Protected Pages

Desktop:

- Sidebar Navigation

Mobile:

- Bottom Navigation
- Drawer Navigation

Primary Navigation Items:

- Dashboard
- Trails
- Check-ins
- Badges
- Leaderboard
- Profile

---

# Layout Guidelines

## Public Pages

Desktop:

- Header
- Main Content
- Footer

Mobile:

- Header
- Main Content
- Footer

## Protected Pages

Desktop:

- Sidebar
- Top Application Header
- Main Content Area

Tablet:

- Collapsible Sidebar

Mobile:

- Bottom Navigation
- Drawer Navigation

All layouts must be responsive.

---

# Responsive Design Rules

Support:

- Mobile
- Tablet
- Desktop

Use responsive Tailwind utilities.

Examples:

```text
sm:
md:
lg:
xl:
```

---

# Responsive Implementation Rules

Use mobile-first design.

Prefer:

- Flexbox
- CSS Grid
- Container-based layouts
- Relative spacing
- Responsive Tailwind utilities

Examples:

```text
container
max-w-*
flex
grid
gap
px
py
```

Avoid:

```text
w-[1200px]
h-[800px]
left-[300px]
top-[200px]
```

Avoid:

- Hard-coded widths
- Hard-coded heights
- Pixel-perfect implementations
- Fixed positioning for layouts
- Excessive absolute positioning

Layouts should adapt naturally across:

- Mobile
- Tablet
- Desktop

---

# Layout Container Rules

Use consistent containers.

Examples:

```text
max-w-7xl mx-auto px-4
sm:px-6
lg:px-8
```

Requirements:

- Consistent horizontal spacing
- Consistent vertical spacing
- Consistent section rhythm

---

# Card Design Rules

Use Shadcn Card components.

Cards should include:

- rounded-xl
- subtle borders
- hover transitions
- soft shadows

Avoid flat enterprise-style cards.

---

# Gamification Visual Rules

XP should always be visually emphasized.

Display when applicable:

- XP Progress
- Current Level
- Badge Collection
- Weekly Streak
- Leaderboard Rank

Use visual rewards to reinforce user progress.

---

# Dashboard Design Rules

Dashboard should be the primary authenticated landing page.

Dashboard should display:

- Current Level
- XP Progress
- Weekly Streak
- Statistics Cards
- Recent Badges
- Recent Check-ins
- Leaderboard Preview

Gamification information should be visible above the fold.

---

# Accessibility Requirements

All pages must:

- Support keyboard navigation
- Maintain sufficient color contrast
- Provide loading states
- Provide empty states
- Provide error states
- Remain responsive

---

# User Experience Rules

Always provide:

## Loading States

Examples:

- Skeletons
- Loading Indicators

## Error States

Examples:

- Error Messages
- Retry Actions

## Empty States

Examples:

- No Trails Found
- No Check-ins Yet
- No Badges Unlocked

## Success Feedback

Examples:

- Toast Notifications
- Success Messages

Never leave users without feedback.

---

# Theme Rules

Support:

- Light Theme
- Dark Theme

Requirements:

- Use Tailwind Dark Mode
- Persist preference in localStorage
- Apply theme on startup

Generate:

```text
themeStore.ts
ThemeToggle.tsx
```

---

# SignalR Rules

When implementing real-time functionality:

Generate:

```text
signalrClient.ts
```

Support:

- Connection Management
- Reconnection Handling
- Event Subscriptions

Use SignalR for:

- Leaderboard Updates
- XP Updates
- Badge Notifications

---

# Testing Rules

Frontend tests belong to the Testing Skill.

Do not generate tests unless the roadmap task explicitly requires testing.

---

# Task Resolution Rules

Determine the current task from roadmap.md.

Generate only files required by that task.

Do not implement future roadmap tasks.

Do not generate unrelated pages, components, stores, or services.

---

# Portfolio Quality Requirement

The application should resemble a production-ready SaaS product.

Avoid:

- Default Bootstrap appearance
- Generic CRUD layouts
- Plain tables as the primary experience

Prefer:

- Rich dashboard experiences
- Visual progress indicators
- Gamification-focused interfaces
- Consistent design language

---

# Output Expectations

Before generating code:

- Explain assumptions
- Explain design decisions

Generated code should be:

- Production-ready
- Readable
- Reusable
- Maintainable

Never generate placeholder TODO implementations.