# Dashboard Preview 🎨

## Customer Dashboard (`/track/[token]`)

The customer-facing dashboard is a clean, modern interface similar to a "pizza tracker" but more detailed.

### Layout Overview

```
┌─────────────────────────────────────────────────────┐
│  Project Name                    [🔄 Refresh]      │
│  Project Description                                │
│  Last updated: 2 minutes ago                        │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Project Status              [IN_PROGRESS]          │
│                                                      │
│  Overall Progress                                     │
│  ████████████░░░░░░░░░░  60%                        │
│                                                      │
│  Expected completion: Feb 15, 2026                  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  ⚠️  Waiting on:                                     │
│  • Design approval from client                       │
│  • Content delivery                                  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Milestones                                          │
│                                                      │
│  ✓  Discovery Phase Complete                         │
│     Completed: Jan 10, 2026                           │
│                                                      │
│  🔵  Design Phase In Progress                        │
│      Target: Feb 1, 2026                            │
│      ⚠️ Attention Needed                             │
│                                                      │
│  ⚠️  Development Phase                               │
│      Target: Feb 15, 2026                           │
│      🚨 Urgent                                       │
│      Blocked by: Design Phase                        │
│                                                      │
│  ○  Launch Phase                                    │
│      Target: Mar 1, 2026                            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Recent Activity                                     │
│                                                      │
│  Milestone "Design Phase" status changed to         │
│  IN_PROGRESS                                         │
│  Jan 25, 2026 at 2:30 PM                            │
│                                                      │
│  Project "Website Redesign" was created              │
│  Jan 20, 2026 at 10:15 AM                           │
└─────────────────────────────────────────────────────┘
```

### Visual Features

#### 1. **Header Section**
- Large project name (3xl font, bold)
- Refresh button (top right)
- Project description (if available)
- "Last updated" timestamp (auto-updates)

#### 2. **Status Card**
- Project status badge (color-coded):
  - 🟢 Green: COMPLETED
  - 🔵 Blue: IN_PROGRESS
  - 🟡 Yellow: ON_HOLD
  - ⚪ Gray: NOT_STARTED
- Progress bar (animated, blue)
- Expected completion date

#### 3. **Blocking Items Alert** (if any)
- Yellow warning box with left border
- Lists items that are blocking progress
- Only shows when there are blocking items

#### 4. **Milestones Timeline**
Each milestone shows:
- **Status Icon**:
  - ✓ Green circle with checkmark (COMPLETED)
  - 🔵 Blue pulsing dot (IN_PROGRESS)
  - 🟣 Purple outlined circle (SCHEDULED)
  - ⚠️ Red outlined circle with warning (BLOCKED)
  - ⚪ Gray outlined circle (PENDING)
- **Risk Indicator Dot** (top-right of icon):
  - 🟢 Green: On Track
  - 🟡 Yellow: Attention Needed
  - 🔴 Red: Urgent
- **Status Badge**:
  - Color-coded badges for each status
- **Blocking Info** (if blocked):
  - Red text showing what's blocking it
- **Dates**:
  - Target date
  - Completed date (if completed)

#### 5. **Activity Feed**
- Recent project updates
- Timestamp for each activity
- Chronological order (newest first)

### Color Scheme
- **Background**: Light gray (`bg-gray-50`)
- **Cards**: White with subtle shadow
- **Primary**: Blue (`blue-600`)
- **Success**: Green (`green-500`)
- **Warning**: Yellow (`yellow-400`)
- **Danger**: Red (`red-500`)

### Auto-Refresh
- Automatically refreshes every 5 minutes
- Manual refresh button available
- Shows "Refreshing..." state

### Mobile Responsive
- Responsive design for all screen sizes
- Touch-friendly buttons
- Optimized spacing for mobile

---

## Admin Dashboard (`/admin`)

A clean, functional admin interface for managing projects.

### Main Page Layout

```
┌─────────────────────────────────────────────────────┐
│  Project Tracker Admin      [+ Create Project]      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Create New Project                                  │
│                                                      │
│  Project Name *                                      │
│  [Website Redesign                    ]              │
│                                                      │
│  Customer Email *                                    │
│  [customer@example.com              ]               │
│                                                      │
│  Description                                         │
│  [Complete website overhaul...       ]              │
│                                                      │
│  [Create Project]                                    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Projects                                            │
├─────────────────────────────────────────────────────┤
│  Website Redesign                                    │
│  customer@example.com                               │
│  Complete website overhaul                           │
│  Status: IN_PROGRESS  Milestones: 3  Tasks: 5        │
│                    [View Details] [Get Tracking Link]│
├─────────────────────────────────────────────────────┤
│  Mobile App Development                              │
│  client@company.com                                  │
│  Status: NOT_STARTED  Milestones: 0  Tasks: 0     │
│                    [View Details] [Get Tracking Link]│
└─────────────────────────────────────────────────────┘
```

### Project Detail Page (`/admin/projects/:id`)

```
┌─────────────────────────────────────────────────────┐
│  ← Back to Projects                                 │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Website Redesign              [IN_PROGRESS]       │
│  customer@example.com                              │
│  Complete website overhaul                          │
│                                                      │
│  Tracking Link:                                     │
│  [https://app.com/track/abc123...] [Copy]          │
│                                                      │
│  OR                                                  │
│                                                      │
│  [Generate Tracking Link]                          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Milestones                    [+ Add Milestone]    │
├─────────────────────────────────────────────────────┤
│  Design Phase Complete                              │
│  All mockups approved                               │
│  Status: COMPLETED  Target: Jan 15, 2026            │
│                                                      │
│  Development Phase                                  │
│  Build out frontend and backend                     │
│  Status: IN_PROGRESS  Target: Feb 1, 2026           │
│  [Status: ▼ IN_PROGRESS]                           │
│                                                      │
│  Launch Phase                                       │
│  Deploy to production                               │
│  Status: PENDING  Target: Mar 1, 2026              │
│  [Status: ▼ PENDING]                               │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Add Milestone                                       │
│                                                      │
│  Milestone Name *                                    │
│  [Design Phase Complete              ]              │
│                                                      │
│  Description                                         │
│  [All mockups approved...           ]              │
│                                                      │
│  Target Date                                         │
│  [2026-02-15                        ]              │
│                                                      │
│  [Create Milestone]                                 │
└─────────────────────────────────────────────────────┘
```

### Visual Features

#### 1. **Main Admin Page**
- Clean list of all projects
- Each project shows:
  - Name (large, bold)
  - Customer email
  - Description (if available)
  - Status, milestone count, task count
  - Action buttons

#### 2. **Create Project Form**
- Inline form (toggles on/off)
- Required fields marked with *
- Clean input fields with rounded corners
- Blue submit button

#### 3. **Project Detail Page**
- Back navigation
- Project info card
- Tracking link display (with copy button)
- Milestone list with status dropdowns
- Add milestone form (toggles on/off)

#### 4. **Status Dropdowns**
- Dropdown menus to quickly update milestone status
- Color-coded status badges
- Instant updates (no page refresh needed)

### Color Scheme
- **Background**: Light gray (`bg-gray-50`)
- **Cards**: White with shadow
- **Primary Action**: Blue (`blue-600`)
- **Success Action**: Green (`green-600`)
- **Secondary**: Gray (`gray-100`)

### Interactive Elements
- Hover effects on buttons
- Smooth transitions
- Loading states
- Success/error alerts
- Copy-to-clipboard functionality

---

## Design Principles

### Customer Dashboard
- **Clean & Simple**: Easy to understand at a glance
- **Visual Progress**: Clear progress indicators
- **Status Clarity**: Color-coded statuses
- **Mobile-First**: Works great on phones
- **Auto-Updates**: No manual refresh needed

### Admin Dashboard
- **Functional**: Get things done quickly
- **Organized**: Clear information hierarchy
- **Actionable**: Easy to create and manage
- **Efficient**: Quick access to common tasks

---

## Screenshots Description

### Customer Dashboard
1. **Header**: Clean white card with project name, refresh button
2. **Status Card**: Blue progress bar, status badge, completion date
3. **Warning Alert**: Yellow box with blocking items (if any)
4. **Milestones**: Vertical timeline with icons, risk indicators, status badges
5. **Activity Feed**: Simple list of recent updates

### Admin Dashboard
1. **Project List**: Clean table-like layout with project cards
2. **Create Form**: Inline form with rounded inputs
3. **Detail Page**: Project info, tracking link, milestone management
4. **Status Controls**: Dropdown menus for quick updates

---

## Responsive Breakpoints

- **Desktop**: Full width, side-by-side layouts
- **Tablet**: Adjusted spacing, stacked elements
- **Mobile**: Single column, touch-friendly buttons

Both dashboards are fully responsive and work great on all devices! 📱💻
