# Trail Explorer - Development Roadmap

# Epic 1 - User Authentication

## Backend

* [ ] Create User entity
* [ ] Configure User table
* [ ] Create RefreshToken entity
* [ ] Configure RefreshToken table
* [ ] Create Register API
* [ ] Create Login API
* [ ] Create Refresh Token API
* [ ] Create Google OAuth API
* [ ] Generate JWT token
* [ ] Configure JWT authentication
* [ ] Implement BCrypt password hashing
* [ ] Configure Role-Based Authorization

## Frontend

* [ ] Create Register page
* [ ] Create Login page
* [ ] Create Auth Store (Zustand)
* [ ] Create Google Login button
* [ ] Configure Protected Routes
* [ ] Add Logout functionality

## Testing

* [ ] Register API tests
* [ ] Login API tests
* [ ] OAuth tests
* [ ] Auth Store tests

---

# Epic 2 - Trail Discovery

## Backend

* [ ] Create Trail entity
* [ ] Configure Trail table
* [ ] Create Get Trails API
* [ ] Create Get Trail By Id API
* [ ] Implement Search API
* [ ] Implement Filter API
* [ ] Implement Pagination
* [ ] Cache Trail List
* [ ] Cache Trail Details

## Frontend

* [ ] Create Explore page
* [ ] Create Trail Card component
* [ ] Create Trail Detail page
* [ ] Add Search UI
* [ ] Add Difficulty Filter

## Testing

* [ ] Trail API tests
* [ ] Search tests
* [ ] Filter tests
* [ ] Trail Card tests

---

# Epic 3 - DOC Trail Synchronisation

## Backend

* [ ] Research DOC API
* [ ] Create DocApiClient
* [ ] Create DTO models
* [ ] Implement API integration
* [ ] Create BackgroundService
* [ ] Create Sync Job
* [ ] Implement Upsert logic
* [ ] Create Seed Data fallback
* [ ] Log Synchronization Events

## Frontend

* [ ] Display synced trails

## Testing

* [ ] DOC API client tests
* [ ] Sync service tests

---

# Epic 4 - Trail Check-In System

## Backend

* [ ] Create CheckIn entity
* [ ] Configure relationships
* [ ] Create Check-In API
* [ ] Create Update Check-In API
* [ ] Create Delete Check-In API
* [ ] Create User Check-In History API
* [ ] Log Trail Completion

## Frontend

* [ ] Create Check-In form
* [ ] Create Check-In History page
* [ ] Edit Check-In UI
* [ ] Delete Check-In UI

## Testing

* [ ] CRUD tests
* [ ] Check-In form tests

---

# Epic 5 - XP & Level System

## Backend

* [ ] Create XpCalculatorService
* [ ] Implement Distance XP Formula
* [ ] Implement Difficulty Multipliers
* [ ] Create LevelCalculatorService
* [ ] Implement Level Threshold Rules
* [ ] Update XP after Check-In

## Frontend

* [ ] Create XP Progress Bar
* [ ] Display Current Level
* [ ] Display XP Progress

## Testing

* [ ] XP calculation tests
* [ ] Level calculation tests

---

# Epic 6 - Achievement & Badge System

## Backend

* [ ] Create Badge entity
* [ ] Create UserBadge entity
* [ ] Create Badge Evaluation Service
* [ ] Create Badge Engine
* [ ] Implement First Trail badge
* [ ] Implement Region badges
* [ ] Implement Distance badges
* [ ] Implement Weekly Streak badges

## Frontend

* [ ] Create Badge Card
* [ ] Create Badge Wall
* [ ] Create Badge Unlock Modal

## Testing

* [ ] Badge Engine tests
* [ ] Badge UI tests

---

# Epic 7 - Dashboard & Statistics

## Backend

* [ ] Create Dashboard API
* [ ] Calculate Trail Statistics
* [ ] Calculate Distance Statistics
* [ ] Calculate User Summary
* [ ] Calculate Weekly Streak
* [ ] Calculate Leaderboard Rank

## Frontend

* [ ] Create Dashboard page
* [ ] Create Statistics Cards
* [ ] Create Achievement Summary
* [ ] Create Progress Widgets
* [ ] Display Weekly Streak
* [ ] Display Leaderboard Rank

## Testing

* [ ] Dashboard API tests
* [ ] Dashboard component tests

---

# Epic 8 - Real-Time Leaderboard

## Backend

* [ ] Create Leaderboard API
* [ ] Create SignalR Hub
* [ ] Broadcast XP Updates
* [ ] Broadcast Ranking Updates
* [ ] Broadcast Badge Unlock Events
* [ ] Cache Leaderboard

## Frontend

* [ ] Create Leaderboard page
* [ ] Connect SignalR Client
* [ ] Handle Real-Time Updates
* [ ] Display Ranking Changes
* [ ] Display Badge Notifications

## Testing

* [ ] Leaderboard tests
* [ ] SignalR integration tests

---

# Epic 9 - User Experience Enhancements

## Theme Switching

* [ ] Create Theme Store
* [ ] Implement Dark Mode
* [ ] Implement Light Mode
* [ ] Save Theme Preference

## Responsive Design

* [ ] Mobile Layout
* [ ] Tablet Layout
* [ ] Desktop Layout

## UI Improvements

* [ ] Toast Notifications
* [ ] Loading States
* [ ] Empty States
* [ ] Error States

## Testing

* [ ] Theme tests
* [ ] Responsive testing

---

# Epic 10 - Deployment & Documentation

## Deployment

* [ ] Deploy Backend
* [ ] Deploy Frontend
* [ ] Configure Production Database
* [ ] Configure Production Environment Variables
* [ ] Verify Public URLs

## README

* [ ] Project Introduction
* [ ] Theme Relation
* [ ] Architecture Overview
* [ ] Unique Features
* [ ] Gamification Features
* [ ] Advanced Features Checklist
* [ ] Security Features
* [ ] Deployment Links
* [ ] Self Reflection

## Specs

* [ ] project-planning.md
* [ ] architecture.md
* [ ] database-design.md
* [ ] design-decisions.md

## AI Collaboration Evidence

* [ ] Prompt Files
* [ ] AI Workflow Documentation
* [ ] AI-Assisted Development Evidence

## Copilot Workflow

* [ ] copilot-instructions.md
* [ ] backend.md
* [ ] frontend.md
* [ ] gamification.md
* [ ] testing.md

## Video

* [ ] AI Usage Demo
* [ ] Design Decisions Demo
* [ ] Architecture Demo
* [ ] Feature Demonstration
* [ ] Final Recording
