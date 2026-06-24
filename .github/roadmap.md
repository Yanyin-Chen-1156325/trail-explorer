# Trail Explorer Development Roadmap

## Epic 1 - Authentication

### Database

* [ ] Create User entity
* [ ] Configure User table
* [ ] Create RefreshToken entity
* [ ] Configure RefreshToken table

### Backend

* [ ] Create Register API
* [ ] Create Login API
* [ ] Create Refresh Token API
* [ ] Create Google OAuth API

### Security

* [ ] Generate JWT token
* [ ] Configure JWT authentication
* [ ] Implement BCrypt password hashing
* [ ] Configure Role-Based Authorization

### Testing

* [ ] Register API tests
* [ ] Login API tests
* [ ] OAuth API tests

---

## Epic 2 - Trail Discovery

### Database

* [ ] Create Trail entity
* [ ] Configure Trail table

### Backend

* [ ] Create Get Trails API
* [ ] Create Get Trail By Id API
* [ ] Implement Search API
* [ ] Implement Filter API
* [ ] Implement Pagination

### Caching

* [ ] Cache Trail List
* [ ] Cache Trail Details

### Frontend

* [ ] Create Explore page
* [ ] Create Trail Card component
* [ ] Create Trail Detail page
* [ ] Add Search UI
* [ ] Add Difficulty Filter

### Testing

* [ ] Trail API tests
* [ ] Search tests
* [ ] Filter tests
* [ ] Trail Card tests

---

## Epic 3 - DOC Trail Synchronisation

### Backend

* [ ] Research DOC API
* [ ] Create DocApiClient
* [ ] Create DOC DTOs
* [ ] Implement DOC API integration
* [ ] Create TrailSyncService
* [ ] Implement Upsert logic
* [ ] Create Seed Data fallback

### Background Jobs

* [ ] Create Trail Synchronisation BackgroundService

### Logging

* [ ] Log Synchronisation Events

### Testing

* [ ] DOC API client tests
* [ ] Synchronisation service tests

---

## Epic 4 - Trail Check-In System

### Database

* [ ] Create CheckIn entity
* [ ] Configure CheckIn table
* [ ] Add User → CheckIns relationship
* [ ] Add Trail → CheckIns relationship

### Backend

* [ ] Create Check-In API
* [ ] Create Update Check-In API
* [ ] Create Delete Check-In API
* [ ] Create User Check-In History API

### Logging

* [ ] Log Trail Completion

### Frontend

* [ ] Create Check-In form
* [ ] Create Check-In History page
* [ ] Create Edit Check-In UI
* [ ] Create Delete Check-In UI

### Testing

* [ ] Check-In API tests
* [ ] Check-In UI tests

---

## Epic 5 - XP and Level System

### Gamification

* [ ] Create XpCalculatorService
* [ ] Implement XP Formula
* [ ] Create LevelCalculatorService
* [ ] Implement Level Rules

### Frontend

* [ ] Create XP Progress Bar
* [ ] Display Current Level
* [ ] Display XP Progress

### Testing

* [ ] XP calculation tests
* [ ] Level calculation tests

---

## Epic 6 - Achievement and Badge System

### Database

* [ ] Create Badge entity
* [ ] Create UserBadge entity
* [ ] Configure UserBadge composite key
* [ ] Add User → UserBadges relationship

### Gamification

* [ ] Create BadgeEvaluationService
* [ ] Create BadgeUnlockService
* [ ] Implement Completion badges
* [ ] Implement Distance badges
* [ ] Implement Region badges
* [ ] Implement Difficulty badges
* [ ] Implement Streak badges

### Frontend

* [ ] Create Badge Card
* [ ] Create Badge Wall
* [ ] Create Badge Unlock Modal

### Testing

* [ ] Badge Engine tests
* [ ] Badge UI tests

---

## Epic 7 - Dashboard and Statistics

### Backend

* [ ] Create Dashboard API
* [ ] Calculate User Summary
* [ ] Calculate Trail Statistics
* [ ] Calculate Distance Statistics
* [ ] Calculate Weekly Streak
* [ ] Calculate Leaderboard Rank

### Frontend

* [ ] Create Dashboard page
* [ ] Create Statistics Cards
* [ ] Create Achievement Summary
* [ ] Create Progress Widgets

### Testing

* [ ] Dashboard API tests
* [ ] Dashboard UI tests

---

## Epic 8 - Real-Time Leaderboard

### Backend

* [ ] Create Leaderboard API

### SignalR

* [ ] Create Leaderboard Hub
* [ ] Broadcast XP Updates
* [ ] Broadcast Ranking Updates
* [ ] Broadcast Badge Unlock Events

### Caching

* [ ] Cache Leaderboard

### Frontend

* [ ] Create Leaderboard page
* [ ] Connect SignalR client
* [ ] Handle real-time updates
* [ ] Display badge notifications

### Testing

* [ ] Leaderboard tests
* [ ] SignalR integration tests

---

## Epic 9 - User Experience Enhancements

### Frontend

* [ ] Create Theme Store
* [ ] Implement Dark Mode
* [ ] Implement Light Mode
* [ ] Persist Theme Preference

### Responsive Design

* [ ] Mobile Layout
* [ ] Tablet Layout
* [ ] Desktop Layout

### User Experience

* [ ] Toast Notifications
* [ ] Loading States
* [ ] Empty States
* [ ] Error States

### Testing

* [ ] Theme tests
* [ ] Responsive tests

---

## Epic 10 - Deployment and Documentation

### Deployment

* [ ] Deploy Backend
* [ ] Deploy Frontend
* [ ] Configure Production Database
* [ ] Configure Environment Variables
* [ ] Verify Public URLs

### Documentation

* [ ] Complete README
* [ ] Complete Architecture Documentation
* [ ] Complete Design Decisions Documentation

### AI Collaboration Evidence

* [ ] Prepare Prompt Evidence
* [ ] Prepare AI Workflow Documentation
* [ ] Prepare AI-Assisted Development Evidence

### Video

* [ ] Record AI Usage Demo
* [ ] Record Design Decisions Demo
* [ ] Record Architecture Demo
* [ ] Record Feature Demonstration
* [ ] Record Final Submission Video
