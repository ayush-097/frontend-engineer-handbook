# Homework: Refactor Monolith

Refactor a 500-line component into well-composed smaller components.

## The Monolith

You're given a `UserDashboard.tsx` (500 lines) that does everything:
- Fetches user data
- Renders profile header
- Shows activity feed
- Displays friend list
- Manages settings panel
- Handles edit mode
- All inline styles

## Your Task

Break it into:
- `UserDashboard.tsx` (< 50 lines) — Composition only
- `ProfileHeader.tsx` — Avatar, name, bio
- `ActivityFeed.tsx` — Recent activity list
- `FriendsList.tsx` — Friend cards
- `SettingsPanel.tsx` — Settings form
- `EditProfileModal.tsx` — Edit dialog

## Requirements

1. Each component has single responsibility
2. No prop drilling (use Context where needed)
3. Shared state managed appropriately
4. Each component independently testable
5. Total lines shouldn't increase more than 20%

## Deliverables
1. Refactored components
2. Before/after comparison
3. Reflection (300 words): What improved? What's harder now?

## Grading: 100 pts
