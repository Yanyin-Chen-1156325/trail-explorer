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

# UI Design System

## Design Inspiration

Trail Explorer uses a combination of:

- AllTrails
- Strava
- Duolingo

Design Goals:

- Modern SaaS appearance
- Outdoor adventure feeling
- Strong gamification
- Professional portfolio quality
- Mobile-first experience

Users should feel:

- Motivated
- Rewarded
- Progress-oriented
- Competitive

---

## Homepage / Landing Page Design Rules

The homepage should introduce Trail Explorer as a gamified hiking product, not as a generic CRUD application.

The homepage should follow the visual direction shown in the approved design mockup:

- Dark outdoor adventure hero section
- Mountain or trail-inspired background imagery
- Strong green accent colors
- Gamification summary card above the fold
- Featured trail cards
- XP progress and badge previews
- Clear calls to action for exploration and authentication

Homepage Goals:

- Explain the product quickly
- Encourage users to explore trails
- Show gamification value immediately
- Make the app feel polished and portfolio-ready
- Work well on mobile, tablet, and desktop

Homepage Structure:

1. Hero Section

Required content:

- Product logo or app name
- Primary headline
- Short description
- Primary call-to-action button
- Secondary call-to-action button
- Gamification summary card

Recommended headline:

```text
Explore Christchurch Trails.
Level Up Your Hiking Journey.
```

Recommended description:

```text
Discover stunning trails, track your adventures, earn achievements, and become a trail legend.
```

Recommended buttons:

```text
Start Exploring
View Leaderboard
```

Hero gamification card should display:

- Current level
- Total XP
- Trails completed
- Weekly streak
- XP progress bar

2. Feature Cards Section

Display three feature cards:

- Discover Trails
- Check In
- Earn Rewards

Each card should include:

- Icon
- Title
- Short description
- Hover transition

3. Featured Trails Section

Display a small preview of hiking trails.

Trail cards should include:

- Trail image or image placeholder
- Trail name
- Region or city
- Difficulty badge
- Distance
- Elevation or duration if available

Example trail cards:

```text
Rapaki Track
Port Hills
Intermediate
7.2 km

Godley Head Track
Banks Peninsula
Advanced
8.0 km

Bottle Lake Forest
Christchurch
Easy
10.0 km
```

4. Progress Preview Section

Show a visual gamification preview.

Display:

- Total XP
- Current level
- XP progress bar
- Recent badges
- Weekly streak
- Leaderboard rank

This section should visually reinforce that user progress is central to the product.

5. Final Call-To-Action Section

Display a strong closing message.

Recommended copy:

```text
Ready to start your next adventure?
Join Trail Explorer and turn every hike into progress.
```

Recommended buttons:

```text
Create Account
Log In
```

Homepage Visual Requirements:

- Use dark mode as the default visual style
- Avoid plain white backgrounds as the primary page background
- Use emerald and green accents for primary actions
- Use amber or gold accents for XP
- Use purple accents for badges
- Use rounded cards and soft shadows
- Use large readable typography
- Use responsive grids
- Keep important gamification information visible above the fold

Homepage Responsive Rules:

Mobile:

- Stack hero content vertically
- Place CTA buttons full-width or near full-width
- Show featured trail cards in a single column
- Keep the gamification card visible early

Tablet:

- Use two-column sections where space allows
- Use two-column card grids

Desktop:

- Use a wide hero layout
- Place hero text on the left
- Place gamification summary card on the right
- Use three-column feature and trail card grids

Homepage File Guidance:

Recommended files:

```text
src/features/home/pages/HomePage.tsx
src/features/home/components/HeroSection.tsx
src/features/home/components/FeatureCard.tsx
src/features/home/components/FeaturedTrailCard.tsx
src/features/home/components/ProgressPreview.tsx
src/features/home/components/HomeCtaSection.tsx
```

Mock data is allowed for the homepage before the related backend APIs are implemented.

When backend APIs become available, replace mock data with typed API services.

Do not implement future roadmap business logic inside homepage components.

---

## Theme Strategy

Default Theme:

- Dark Mode

Optional Theme:

- Light Mode

Dark Mode is the primary user experience.

Avoid white backgrounds as the primary application theme.

---

## Color Palette

Background

#0F172A

Surface

#1E293B

Primary

#10B981

Secondary

#22C55E

XP

#F59E0B

Badge

#8B5CF6

Danger

#EF4444

Text Primary

#F8FAFC

Text Secondary

#94A3B8

---

## Layout Guidelines

Desktop Layout

- Fixed left sidebar navigation
- Top application header
- Main content area

Tablet Layout

- Collapsible sidebar
- Responsive grid layouts

Mobile Layout

- Bottom navigation
- Drawer menu for secondary actions

All layouts must be responsive.

---

## Navigation Style

Inspired by AllTrails and Strava.

Desktop:

- Sidebar navigation

Mobile:

- Bottom navigation

Primary Navigation Items:

- Dashboard
- Trails
- Check-ins
- Badges
- Leaderboard
- Profile

---

## Dashboard Design Rules

Dashboard should be the primary application landing page.

Dashboard must display:

- Current Level
- XP Progress
- Weekly Streak
- Statistics Cards
- Recent Badges
- Recent Check-ins
- Leaderboard Preview

Gamification information should be visible above the fold.

---

## Gamification Visual Rules

XP should always be visually emphasized.

Display:

- XP Progress Bar
- Current Level
- Badge Collection
- Weekly Streak
- Ranking Position

Use visual rewards to reinforce user progress.

Badge unlocks should feel rewarding.

---

## Card Design Rules

Use Shadcn Card components.

Cards should include:

- rounded-xl
- subtle border
- hover transition
- soft shadow

Avoid flat enterprise-style cards.

---

## Responsive Design Requirements

Mobile First Design.

Support:

- Mobile
- Tablet
- Desktop

Recommended Breakpoints:

sm: 640px

md: 768px

lg: 1024px

xl: 1280px

Pages must remain fully usable on smaller screens.

---

## Accessibility Requirements

All pages must:

- Support keyboard navigation
- Maintain sufficient color contrast
- Provide loading states
- Provide empty states
- Provide error states
- Be responsive on all supported devices

---

## Portfolio Quality Requirement

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
