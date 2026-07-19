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
- [x] Add Trail ImageUrl field

### Backend

- [x] Create Get Trails API
- [x] Create Get Trail By Id API
- [x] Implement Search API
- [x] Implement Filter API
- [x] Implement Pagination
- [x] Map DOC introductionThumbnail into Trail ImageUrl
- [x] Return ImageUrl in TrailResponse

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
- [x] Use Trail ImageUrl as Trail Detail hero background
- [x] Add fallback hero background for trails without images

### Unit Testing

- [x] Backend
- [x] Frontend

### Integration Testing

- [x] Trail API tests
- [x] Search tests
- [x] Filter tests
- [x] Trail Card tests
- [x] Trail image synchronisation tests
- [x] Trail Detail hero image tests

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

- [x] XP calculation tests
- [x] Level calculation tests

---

## Epic 6 - Achievement and Badge System

### Database

- [x] Create Badge entity
- [x] Create UserBadge entity
- [x] Seed default badges
- [x] Configure UserBadge composite key
- [x] Add User → UserBadges relationship

### Gamification

- [x] Create BadgeEvaluationService
- [x] Create BadgeUnlockService
- [x] Implement Completion badges
- [x] Implement Distance badges
- [x] Implement Region badges
- [x] Implement Difficulty badges
- [x] Implement Streak badges

### Frontend

- [x] Create Badge Card
- [x] Create Badge Wall
- [x] Create Badge Unlock Modal

### Unit Testing

- [x] Backend
- [x] Frontend

### Testing

- [x] Badge Engine tests
- [x] Badge UI tests

---

## Epic 7 - Dashboard and Statistics

### Backend

- [x] Create Dashboard API
- [x] Calculate User Summary
- [x] Calculate Trail Statistics
- [x] Calculate Distance Statistics
- [x] Calculate Weekly Streak
- [x] Calculate Leaderboard Rank
- [x] Create Admin Trigger DOC Sync API

### Frontend

- [x] Create Dashboard page
- [x] Display User Progress On Dashboard
- [x] Create Statistics Cards
- [x] Create Achievement Summary
- [x] Create Progress Widgets
- [x] Add Admin DOC Sync action to Dashboard
- [x] Display DOC Sync result feedback
- [x] Protect DOC Sync action with Admin role

### Unit Testing

- [x] Backend
- [x] Frontend
- [x] Admin DOC Sync service tests
- [x] Admin Dashboard DOC Sync UI tests

### Integration Testing

- [x] Dashboard API tests
- [x] Dashboard UI tests
- [x] Admin DOC Sync API tests

---

## Epic 8 - Real-Time Leaderboard

### Backend

- [x] Create Leaderboard API
- [x] Create Leaderboard Hub
- [x] Broadcast XP Updates
- [x] Broadcast Ranking Updates
- [x] Broadcast Badge Unlock Events

### Caching

- [x] Cache Leaderboard
- [x] Invalidate Leaderboard Cache on XP Updates

### Frontend

- [x] Create Leaderboard page
- [x] Create SignalR Client Service
- [x] Connect SignalR client
- [x] Handle real-time updates
- [x] Display badge notifications

### Unit Testing

- [x] Backend
- [x] Frontend

### Integration Testing

- [x] Leaderboard tests
- [x] SignalR integration tests

---

## Epic 9 - User Experience Enhancements

### Frontend

- [x] Create Theme Store
- [x] Implement Dark Mode
- [x] Implement Light Mode
- [x] Persist Theme Preference

### Responsive Design

- [x] Mobile Layout
- [x] Tablet Layout
- [x] Desktop Layout

### User Experience

- [x] Toast Notifications
- [x] Loading States
- [x] Empty States
- [x] Error States

### Unit Testing

- [x] Backend
- [x] Frontend

### Integration Testing

- [x] Theme tests
- [x] Responsive tests

---

## Epic 10 - Achievement Notification Center

### Database

- [x] Create Notification entity
- [x] Configure Notification table
- [x] Add User to Notifications relationship
- [x] Store notification type, title, message, read state, and created time

### Backend

- [x] Create Get My Notifications API
- [x] Create Get Unread Notification Count API
- [x] Create Mark Notification As Read API
- [x] Create Mark All Notifications As Read API
- [x] Create Notification Service
- [x] Create notifications when badges are unlocked
- [x] Create notifications when XP is gained
- [x] Create notifications when users level up
- [x] Create notifications when weekly streak milestones are reached

### Real-Time Updates

- [x] Broadcast new notification events with SignalR
- [x] Broadcast unread notification count updates with SignalR

### Frontend

- [x] Create Notification API client
- [x] Create Notification Store
- [x] Create top-right notification indicator
- [x] Display unread notification count
- [x] Create Notification List UI
- [x] Display unread and read notification states
- [x] Show top-right toast when a new achievement notification is received
- [x] Allow users to mark an individual notification as read
- [x] Allow users to mark all notifications as read

### Unit Testing

- [x] Backend
- [x] Frontend

### Integration Testing

- [x] Notification API tests
- [x] Notification read state tests
- [x] Unread notification count tests
- [x] SignalR notification tests
- [x] Notification UI tests

---

## Epic 11 - Deployment and Documentation

### Deployment

- [x] Deploy Backend
- [x] Deploy Frontend
- [x] Configure Production Database
- [x] Configure Environment Variables
- [x] Verify Public URLs
