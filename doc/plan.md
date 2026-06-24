# Trail Explorer

## Project Vision

Trail Explorer is a gamified hiking platform designed for New Zealand hiking enthusiasts.

The application encourages users to explore trails, record completed hikes, earn achievements, maintain activity streaks, and compete with other hikers through leaderboards.

The project combines outdoor exploration with gamification principles to increase user engagement and long-term participation.

---

# Project Goals

Users can:

* Register and login
* Login using Google OAuth
* Browse hiking trails
* Search and filter trails
* Record completed trails
* Earn XP
* Level up
* Unlock badges
* Maintain weekly streaks
* View statistics
* Compete on leaderboards

---

# Core Features

## User Authentication

### Features

* Register
* Login
* Logout
* Google OAuth
* User Profile

### Technology

Backend

* ASP.NET Core Web API (.NET 10)
* JWT Authentication
* Refresh Tokens
* BCrypt

Frontend

* React
* Zustand

---

## Trail Discovery

### Features

* Browse trails
* View trail details
* Search trails
* Filter trails
* Pagination

### Technology

Backend

* DOC API
* EF Core
* SQLite
* IMemoryCache

Frontend

* React
* Tailwind CSS
* Shadcn UI

---

## Trail Check-In

### Features

* Record completed trails
* Upload optional photo
* Add notes
* View check-in history

### Technology

Backend

* CRUD APIs
* EF Core

Frontend

* React Forms

---

# Gamification Features

## XP System

XP is calculated dynamically.

Formula:

XP = (DistanceKm × 10) × DifficultyMultiplier

Difficulty Multipliers:

* Easy = 1.0
* Intermediate = 1.2
* Advanced = 1.5
* Expert = 2.0

---

## Level System

Levels are calculated from total XP.

Level information is not stored in the database.

Example milestones:

* Level 1 = 0 XP
* Level 2 = 500 XP
* Level 3 = 1,000 XP
* Level 4 = 2,000 XP
* Level 5 = 3,500 XP

---

## Achievement System

### Completion Badges

* First Trail
* 10 Trails Completed
* 25 Trails Completed
* 50 Trails Completed

### Distance Badges

* 50km Explorer
* 100km Explorer
* 250km Explorer

### Region Badges

* Port Hills Explorer
* Banks Peninsula Explorer
* Christchurch Explorer

### Difficulty Badges

* First Advanced Trail
* First Expert Trail

### Weekly Streak Badges

* 2 Week Streak
* 4 Week Streak
* 8 Week Streak

---

## Weekly Streak System

A streak is maintained when a user records at least one completed trail during a calendar week.

Missing a week resets the streak.

Streak values are calculated dynamically.

---

## Dashboard

Display:

* Total XP
* Current Level
* Completed Trails
* Total Distance
* Weekly Streak
* Unlocked Badges
* Leaderboard Rank

---

## Leaderboard

Ranking order:

1. Total XP
2. Trails Completed
3. Total Distance

Leaderboards are calculated dynamically and are not stored in the database.

---

# Advanced Features

## Security Measures

* JWT Authentication
* Role-Based Authorization
* BCrypt Password Hashing
* FluentValidation
* Rate Limiting

---

## State Management

* Zustand

---

## Theme Switching

* Light Mode
* Dark Mode

---

## Real-Time Updates

* SignalR
* Real-Time Leaderboards
* Badge Notifications
* XP Notifications

---

## Logging

* Serilog
* Authentication Logs
* Check-In Logs
* Badge Logs
* Synchronization Logs

---

## Caching

* IMemoryCache
* Trail List Cache
* Trail Detail Cache
* Leaderboard Cache

---

## Docker

* Backend Dockerfile
* Frontend Dockerfile
* docker-compose.yml

---

# Technical Architecture

Frontend

* React
* TypeScript
* Zustand
* Tailwind CSS
* Shadcn UI
* SignalR Client

Backend

* ASP.NET Core Web API
* Entity Framework Core
* SignalR
* BackgroundService
* Serilog
* IMemoryCache

Database

* SQLite

External Services

* DOC Public API

---

# AI-Assisted Development

The project uses GitHub Copilot and structured AI-assisted development.

AI collaboration artifacts are maintained within:

.github/

* copilot-instructions.md

instructions/

* backend.md
* frontend.md
* gamification.md
* testing.md

These files define development standards, architecture rules, testing requirements, and gamification rules used throughout the project.

---

# Development Roadmap

1. User Authentication
2. Trail Discovery
3. DOC Trail Synchronisation
4. Trail Check-In System
5. XP & Level System
6. Achievement & Badge System
7. Dashboard & Statistics
8. Real-Time Leaderboard
9. User Experience Enhancements
10. Deployment & Documentation
