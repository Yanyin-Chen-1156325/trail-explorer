# Gamification Development Skill

## Purpose

Use this skill whenever implementing gamification features for Trail Explorer.

This skill defines the business rules for:

* XP
* Levels
* Weekly Streaks
* Badges
* Leaderboards
* Dashboard Statistics

Always follow these rules unless explicitly instructed otherwise.

---

## Core Principle

Gamification values are derived from user activity.

Do NOT create database tables for:

* XP
* Level
* Streak
* Leaderboard

These values must be calculated dynamically from:

* CheckIns
* Trails
* UserBadges

---

# XP System

XP is awarded when a user completes a trail.

## Formula

Base XP:

DistanceKm × 10

Difficulty Multiplier:

Easy = 1.0

Intermediate = 1.2

Advanced = 1.5

Expert = 2.0

Final Formula:

XP = (DistanceKm × 10) × DifficultyMultiplier

## Examples

5km Easy

= 50 XP

10km Intermediate

= 120 XP

12km Advanced

= 180 XP

20km Expert

= 400 XP

## Requirements

Generate:

* XpCalculatorService
* Unit Tests

XP should never be stored in the database.

---

# Level System

Levels are calculated from Total XP.

Level should never be stored in the database.

## Level Thresholds

Level 1 = 0 XP

Level 2 = 500 XP

Level 3 = 1,000 XP

Level 4 = 2,000 XP

Level 5 = 3,500 XP

Level 6 = 5,000 XP

Level 7 = 7,500 XP

Level 8 = 10,000 XP

Level 9 = 15,000 XP

Level 10 = 20,000 XP

## Requirements

Generate:

* LevelCalculatorService
* Unit Tests

---

# Weekly Streak System

A streak is maintained when a user completes at least one trail check-in during a calendar week.

## Rules

A week counts if:

* At least one check-in exists during the week

Multiple check-ins within the same week:

* Count as a single successful week

Missing a week:

* Resets the streak

## Examples

Week 1 ✓

Week 2 ✓

Week 3 ✓

Week 4 ✓

Current Streak = 4

---

Week 1 ✓

Week 2 ✓

Week 3 ✗

Week 4 ✓

Current Streak = 1

## Requirements

Generate:

* StreakCalculatorService
* Unit Tests

Streak should never be stored in the database.

---

# Badge System

Badges are defined in the Badge table.

Unlocked badges are stored in UserBadge.

Generate:

* BadgeEngine
* BadgeEvaluationService
* BadgeUnlockService
* Unit Tests

---

## Completion Badges

### First Trail

Requirement:

Complete 1 trail

### Trail Explorer

Requirement:

Complete 10 trails

### Trail Master

Requirement:

Complete 25 trails

### Trail Legend

Requirement:

Complete 50 trails

### Trail Champion

Requirement:

Complete 100 trails

---

## Distance Badges

### 50km Explorer

Requirement:

Complete 50km total distance

### 100km Explorer

Requirement:

Complete 100km total distance

### 250km Explorer

Requirement:

Complete 250km total distance

### 500km Explorer

Requirement:

Complete 500km total distance

### 1000km Explorer

Requirement:

Complete 1000km total distance

---

## Region Badges

### Port Hills Explorer

Requirement:

Complete trails in Port Hills

### Banks Peninsula Explorer

Requirement:

Complete trails in Banks Peninsula

### Canterbury Explorer

Requirement:

Complete trails across Canterbury regions

---

## Difficulty Badges

### Advanced Explorer

Requirement:

Complete first Advanced trail

### Expert Explorer

Requirement:

Complete first Expert trail

### Expert Specialist

Requirement:

Complete 5 Expert trails

### Expert Master

Requirement:

Complete 10 Expert trails

---

## Weekly Streak Badges

### 2 Week Streak

Requirement:

Maintain a 2-week streak

### 4 Week Streak

Requirement:

Maintain a 4-week streak

### 8 Week Streak

Requirement:

Maintain an 8-week streak

### 12 Week Streak

Requirement:

Maintain a 12-week streak

### 24 Week Streak

Requirement:

Maintain a 24-week streak

---

# Leaderboard System

Leaderboards are calculated dynamically.

Do NOT create a Leaderboard table.

Generate:

* LeaderboardService
* Ranking DTOs
* Unit Tests

## Ranking Rules

Sort users by:

1. Total XP (Descending)
2. Trails Completed (Descending)
3. Total Distance (Descending)

---

# Dashboard Statistics

Generate calculations for:

* Total XP
* Current Level
* Completed Trails
* Total Distance
* Current Weekly Streak
* Unlocked Badges
* Leaderboard Rank

All values should be calculated dynamically.

---

# Gamification Event Flow

Whenever a CheckIn is created:

1. Save CheckIn
2. Recalculate XP
3. Recalculate Level
4. Recalculate Weekly Streak
5. Evaluate Badge Unlocks
6. Refresh Leaderboard Rankings
7. Broadcast SignalR Updates

---

# SignalR Integration

Broadcast events when gamification changes occur.

Examples:

* XPUpdated
* BadgeUnlocked
* RankChanged

Use SignalR for real-time leaderboard updates.

---

# Testing Requirements

All gamification logic must be covered by automated tests.

Required coverage:

## XP

* Easy Trail XP
* Intermediate Trail XP
* Advanced Trail XP
* Expert Trail XP

## Levels

* Level Thresholds
* Boundary Conditions

## Streaks

* Consecutive Weeks
* Missing Week
* Multiple CheckIns Same Week

## Badges

* Completion Badges
* Distance Badges
* Region Badges
* Difficulty Badges
* Streak Badges

## Leaderboards

* Ranking Order
* Tie Scenarios

---

# Output Expectations

When implementing a gamification feature generate:

1. Service Interface
2. Service Implementation
3. DTOs
4. Unit Tests

Explain business rules before generating code.

Keep all rule values centralized.

Never hardcode rule values across multiple services.
