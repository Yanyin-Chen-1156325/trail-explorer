# Trail Explorer Development Roadmap

## Epic 1 - Authentication & User Management

### Database

- [x] Create User entity
- [x] Configure User table
- [x] Create RefreshToken entity
- [x] Configure RefreshToken table

### Backend

- [x] Create Register API
- [x] Create Login API
- [x] Create Refresh Token API
- [x] Create Logout API
- [x] Create Google OAuth API
- [x] Create Get Users API
- [x] Create Update User Role API
- [x] Create Update User Status API

### Security

- [x] Generate JWT token
- [x] Configure JWT authentication
- [x] Implement BCrypt password hashing
- [x] Create UserRole enum
- [x] Configure Authorization Policies
- [x] Add Role claim to JWT
- [x] Protect Admin APIs
- [x] Prevent suspended users from signing in
- [x] Prevent admins from changing their own status

### Frontend

- [x] Create Auth API client
- [x] Create Auth Store (Zustand)
- [x] Create Register page
- [x] Create Login page
- [x] Create Google Login button
- [x] Configure Protected Routes
- [x] Add Logout functionality
- [x] Create HomePage
- [x] Create User Management Page
- [x] Display User List
- [x] Change User Role
- [x] Change User Status

### Unit Testing

- [x] Backend
- [x] Frontend

### Integration Testing

- [x] Register tests
- [x] Login tests
- [x] Refresh Token tests
- [x] Logout tests
- [x] OAuth tests
- [x] Get Users tests
- [x] Update User Role tests
- [x] Update User Status tests

---

## Epic 2 - Trail Discovery

### Database

- [x] Create Trail entity
- [x] Configure Trail table

### Backend

- [ ] Create Get Trails API
- [ ] Create Get Trail By Id API
- [ ] Implement Search API
- [ ] Implement Filter API
- [ ] Implement Pagination

### Caching

- [ ] Cache Trail List
- [ ] Cache Trail Details

### Frontend

- [ ] Create Trail API client
- [ ] Create Explore page
- [ ] Create Trail Card component
- [ ] Create Trail Detail page
- [ ] Add Search UI
- [ ] Add Difficulty Filter

### Testing

- [ ] Trail API tests
- [ ] Search tests
- [ ] Filter tests
- [ ] Trail Card tests

---

## Epic 3 - DOC Trail Synchronisation

### Backend

- [ ] Research DOC API
- [ ] Create DocApiClient
- [ ] Create DOC DTOs
- [ ] Implement DOC API integration
- [ ] Create TrailSyncService
- [ ] Implement Upsert logic
- [ ] Create Seed Data fallback

### Background Jobs

- [ ] Create Trail Synchronisation BackgroundService

### Logging

- [ ] Log Synchronisation Events

### Testing

- [ ] DOC API client tests
- [ ] Synchronisation service tests

---

## Epic 4 - Trail Check-In System

### Database

- [ ] Create CheckIn entity
- [ ] Configure CheckIn table
- [ ] Add User → CheckIns relationship
- [ ] Add Trail → CheckIns relationship

### Backend

- [ ] Create Check-In API
- [ ] Create Update Check-In API
- [ ] Create Delete Check-In API
- [ ] Create User Check-In History API
- [ ] Create Get All Check-Ins API
- [ ] Create Hide Check-In API
- [ ] Create Restore Check-In API

### Security

- [ ] Authorize Check-In Ownership
- [ ] Protect Moderator APIs

### Logging

- [ ] Log Trail Completion

### Frontend

- [ ] Create Check-In form
- [ ] Create Check-In History page
- [ ] Create Edit Check-In UI
- [ ] Create Delete Check-In UI
- [ ] Create Moderation Page
- [ ] Display All Check-Ins
- [ ] Hide Check-In
- [ ] Restore Check-In

### Testing

- [ ] Check-In API tests
- [ ] Check-In UI tests

---

## Epic 5 - XP and Level System

### Gamification

- [ ] Create XpCalculatorService
- [ ] Implement XP Formula
- [ ] Create LevelCalculatorService
- [ ] Implement Level Rules
- [ ] Create User Progress DTO

### Frontend

- [ ] Create XP Progress Bar
- [ ] Display Current Level
- [ ] Display XP Progress

### Testing

- [ ] XP calculation tests
- [ ] Level calculation tests

---

## Epic 6 - Achievement and Badge System

### Database

- [ ] Create Badge entity
- [ ] Create UserBadge entity
- [ ] Seed default badges
- [ ] Configure UserBadge composite key
- [ ] Add User → UserBadges relationship

### Gamification

- [ ] Create BadgeEvaluationService
- [ ] Create BadgeUnlockService
- [ ] Implement Completion badges
- [ ] Implement Distance badges
- [ ] Implement Region badges
- [ ] Implement Difficulty badges
- [ ] Implement Streak badges

### Frontend

- [ ] Create Badge Card
- [ ] Create Badge Wall
- [ ] Create Badge Unlock Modal

### Testing

- [ ] Badge Engine tests
- [ ] Badge UI tests

---

## Epic 7 - Dashboard and Statistics

### Backend

- [ ] Create Dashboard API
- [ ] Calculate User Summary
- [ ] Calculate Trail Statistics
- [ ] Calculate Distance Statistics
- [ ] Calculate Weekly Streak
- [ ] Calculate Leaderboard Rank

### Frontend

- [ ] Create Dashboard page
- [ ] Create Statistics Cards
- [ ] Create Achievement Summary
- [ ] Create Progress Widgets

### Testing

- [ ] Dashboard API tests
- [ ] Dashboard UI tests

---

## Epic 8 - Real-Time Leaderboard

### Backend

- [ ] Create Leaderboard API
- [ ] Create Leaderboard Hub
- [ ] Broadcast XP Updates
- [ ] Broadcast Ranking Updates
- [ ] Broadcast Badge Unlock Events

### Caching

- [ ] Cache Leaderboard
- [ ] Invalidate Leaderboard Cache on XP Updates

### Frontend

- [ ] Create Leaderboard page
- [ ] Create SignalR Client Service
- [ ] Connect SignalR client
- [ ] Handle real-time updates
- [ ] Display badge notifications

### Testing

- [ ] Leaderboard tests
- [ ] SignalR integration tests

---

## Epic 9 - User Experience Enhancements

### Frontend

- [ ] Create Theme Store
- [ ] Implement Dark Mode
- [ ] Implement Light Mode
- [ ] Persist Theme Preference

### Responsive Design

- [ ] Mobile Layout
- [ ] Tablet Layout
- [ ] Desktop Layout

### User Experience

- [ ] Toast Notifications
- [ ] Loading States
- [ ] Empty States
- [ ] Error States

### Testing

- [ ] Theme tests
- [ ] Responsive tests

---

## Epic 10 - Deployment and Documentation

### Deployment

- [ ] Deploy Backend
- [ ] Deploy Frontend
- [ ] Configure Production Database
- [ ] Configure Environment Variables
- [ ] Verify Public URLs

### Documentation

- [ ] Complete README
- [ ] Complete project-planning.md
- [ ] Complete architecture.md
- [ ] Complete database-design.md
- [ ] Complete design-decisions.md

### AI Collaboration Evidence

- [ ] Prepare Prompt Evidence
- [ ] Prepare AI Workflow Documentation
- [ ] Prepare AI-Assisted Development Evidence

### Video

- [ ] Record AI Usage Demo
- [ ] Record Design Decisions Demo
- [ ] Record Architecture Demo
- [ ] Record Feature Demonstration
- [ ] Record Final Submission Video
