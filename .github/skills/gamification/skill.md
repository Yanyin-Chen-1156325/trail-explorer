# Gamification Development Skill

## Purpose

Use this skill whenever implementing gamification features.

This skill defines the business rules for:

* XP
* Levels
* Weekly Streaks
* Badges
* Leaderboards
* Dashboard Statistics

This skill is NOT responsible for:

* Database Design
* Entity Definitions
* API Endpoints
* Controllers
* Authentication
* Frontend Components

Those concerns belong to other skills.

---

# Core Principle

Gamification values are derived from user activity.

Never create database tables for:

* XP
* Level
* Streak
* Leaderboard

These values must always be calculated dynamically.

---

# XP System

XP is awarded when a user completes a trail.

## Formula

Base XP:

```text id="9w1mq0"
DistanceKm × 10
```

Difficulty Multiplier:

```text id="8bhd9z"
Easy         = 1.0
Intermediate = 1.2
Advanced     = 1.5
Expert       = 2.0
```

Final Formula:

```text id="1gg7fw"
XP = (DistanceKm × 10) × DifficultyMultiplier
```

## Examples

```text id="8o1x0m"
5km Easy
= 50 XP

10km Intermediate
= 120 XP

12km Advanced
= 180 XP

20km Expert
= 400 XP
```

## Requirements

Generate:

```text id="igpv1f"
IXpCalculatorService
XpCalculatorService
```

XP should never be stored in the database.

---

# Level System

Levels are calculated from Total XP.

Levels should never be stored.

## Level Thresholds

```text id="64ev4x"
Level 1  = 0 XP
Level 2  = 500 XP
Level 3  = 1000 XP
Level 4  = 2000 XP
Level 5  = 3500 XP
Level 6  = 5000 XP
Level 7  = 7500 XP
Level 8  = 10000 XP
Level 9  = 15000 XP
Level 10 = 20000 XP
```

## Requirements

Generate:

```text id="l80hgh"
ILevelCalculatorService
LevelCalculatorService
```

---

# Weekly Streak System

A streak is maintained when a user completes at least one trail during a calendar week.

## Rules

A week counts when:

```text id="i0f5wq"
At least one check-in exists during the week.
```

Multiple check-ins in the same week:

```text id="r9r1db"
Count as one successful week.
```

Missing a week:

```text id="p7if4j"
Resets the streak.
```

## Requirements

Generate:

```text id="av1mqz"
IStreakCalculatorService
StreakCalculatorService
```

Streak should never be stored.

---

# Achievement System

Badges are defined in the Badge table.

Unlocked badges are stored in UserBadge.

Generate:

```text id="7qayzu"
IBadgeEvaluationService
BadgeEvaluationService

IBadgeUnlockService
BadgeUnlockService
```

---

# Completion Badges

## First Trail

Requirement:

```text id="f8a9oc"
1 completed trail
```

## Trail Explorer

Requirement:

```text id="hn53mz"
10 completed trails
```

## Trail Master

Requirement:

```text id="pk2kdh"
25 completed trails
```

## Trail Legend

Requirement:

```text id="h5zhxk"
50 completed trails
```

## Trail Champion

Requirement:

```text id="jktkhv"
100 completed trails
```

---

# Distance Badges

## 50km Explorer

```text id="hvkr3e"
50km total distance
```

## 100km Explorer

```text id="lgv15d"
100km total distance
```

## 250km Explorer

```text id="h1z0jm"
250km total distance
```

## 500km Explorer

```text id="mhk0kn"
500km total distance
```

## 1000km Explorer

```text id="w83vn9"
1000km total distance
```

---

# Region Badges

## Port Hills Explorer

Requirement:

```text id="q5nmxt"
Complete trails in Port Hills.
```

## Banks Peninsula Explorer

Requirement:

```text id="gctcgt"
Complete trails in Banks Peninsula.
```

## Canterbury Explorer

Requirement:

```text id="8o1ex6"
Complete trails across Canterbury regions.
```

---

# Difficulty Badges

## Advanced Explorer

Requirement:

```text id="lgolfe"
First Advanced trail.
```

## Expert Explorer

Requirement:

```text id="upcxv3"
First Expert trail.
```

## Expert Specialist

Requirement:

```text id="vrczqg"
5 Expert trails.
```

## Expert Master

Requirement:

```text id="k6u4qn"
10 Expert trails.
```

---

# Streak Badges

## 2 Week Streak

```text id="xx77n9"
2 consecutive weeks
```

## 4 Week Streak

```text id="f2eh8q"
4 consecutive weeks
```

## 8 Week Streak

```text id="eb3b3d"
8 consecutive weeks
```

## 12 Week Streak

```text id="l1wb8y"
12 consecutive weeks
```

## 24 Week Streak

```text id="4vjlwm"
24 consecutive weeks
```

---

# Leaderboard Rules

Leaderboards are calculated dynamically.

Never create a Leaderboard table.

Generate:

```text id="kp63yb"
ILeaderboardService
LeaderboardService
```

Ranking Order:

```text id="d8zb0d"
1. Total XP Descending
2. Completed Trails Descending
3. Total Distance Descending
```

---

# Dashboard Statistics

Generate calculations for:

* Total XP
* Current Level
* Completed Trails
* Total Distance
* Weekly Streak
* Unlocked Badges
* Leaderboard Rank

All values must be calculated dynamically.

---

# Gamification Event Flow

When a CheckIn is created:

```text id="m3n0i2"
1. Save CheckIn
2. Recalculate XP
3. Recalculate Level
4. Recalculate Weekly Streak
5. Evaluate Badge Unlocks
6. Refresh Leaderboard Rankings
```

This defines business flow only.

Implementation details belong to Backend Skill.

---

# Task Resolution Rules

Determine the current task from roadmap.md.

Generate only the services required by the current task.

Do not implement future roadmap tasks.

Do not generate unrelated services.

---

# Output Expectations

Before generating code:

* Explain business rules
* Explain assumptions

Generated code should be:

* Production-ready
* Testable
* Maintainable

Keep all rule values centralized.

Never duplicate rule values across multiple services.
