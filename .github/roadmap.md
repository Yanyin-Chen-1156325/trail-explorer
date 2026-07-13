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

## Epic 2 - DOC Trail Synchronisation

### Backend

- [x] Research DOC API
- [x] Create DocApiClient
- [x] Create DOC DTOs
- [x] Implement DOC API integration
- [x] Create TrailSyncService
- [x] Implement Upsert logic

### Background Jobs

- [x] Create Trail Synchronisation BackgroundService

### Logging

- [x] Log Synchronisation Events

### Testing

- [x] DOC API client tests
- [x] Synchronisation service tests

---

## Epic 3 - Trail Discovery

### Database

- [x] Create Trail entity
- [x] Configure Trail table

### Backend

- [x] Create Get Trails API
- [x] Create Get Trail By Id API
- [x] Implement Search API
- [x] Implement Filter API
- [x] Implement Pagination

### Caching

- [x] Cache Trail List
- [x] Cache Trail Details

### Frontend

- [x] Create Trail API client
- [x] Create Explore page (use map)
- [x] Create Trail Card component
- [x] Create Trail Detail page
- [x] Add Search UI
- [x] Add Difficulty Filter

### Unit Testing

- [x] Backend
- [x] Frontend

### Integration Testing

- [x] Trail API tests
- [x] Search tests
- [x] Filter tests
- [x] Trail Card tests

---

## Epic 4 - Trail Check-In System

### Database

- [x] Create CheckIn entity
- [x] Configure CheckIn table
- [x] Add User → CheckIns relationship
- [x] Add Trail → CheckIns relationship

### Backend

- [x] Create Check-In API
- [x] Create Update Check-In API
- [x] Create Delete Check-In API
- [x] Create User Check-In History API
- [x] Create Get All Check-Ins API
- [x] Create Hide Check-In API
- [x] Create Restore Check-In API

### Security

- [x] Authorize Check-In Ownership
- [x] Protect Moderator APIs

### Logging

- [x] Log Trail Completion

### Frontend

- [x] Create Check-In form
- [x] Create Check-In History page
- [x] Create Edit Check-In UI
- [x] Create Delete Check-In UI
- [x] Create Moderation Page
- [x] Display All Check-Ins
- [x] Hide Check-In
- [x] Restore Check-In

### Unit Testing

- [x] Backend
- [x] Frontend

### Intergration Testing

- [x] Check-In API tests
- [x] Check-In UI tests

---

## Epic 5 - XP and Level System

### Gamification

- [x] Create XpCalculatorService
- [x] Implement XP Formula
- [x] Create LevelCalculatorService
- [x] Implement Level Rules
- [x] Create User Progress DTO
- [x] Create User Progress Service
- [x] Calculate User Total XP From Check-Ins
- [x] Create Get My Progress API
- [x] Protect Progress API

### Frontend

- [x] Create XP Progress Bar
- [x] Display Current Level
- [x] Display XP Progress
- [x] Create Progress API client

### Unit Testing

- [x] Backend
- [x] Frontend

### Integration Testing

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
- [ ] Display User Progress On Dashboard
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
