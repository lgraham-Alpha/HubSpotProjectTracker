# HubSpot Project Tracker - Project Plan

## Project Overview
A comprehensive project tracking system integrated with HubSpot to manage and monitor projects, tasks, and deliverables. **Key Feature**: Customers can click a link in their email to view a detailed, real-time project status dashboard (similar to Domino's pizza tracker but more comprehensive).

**Data Flow**: HubSpot → Project Tracker → Customer Dashboard (read-only)
- Admins create/update projects in HubSpot or the Project Tracker
- Customers view status via secure email links (tokens provide access, no login needed)
- No bidirectional sync - projects are managed in the tracker, customers just view

## Goals
- **Customer-Facing Dashboard**: Provide customers with secure, no-login-required access to their project status via email links
- Track HubSpot-related projects and their status
- Integrate with HubSpot API for data synchronization
- Provide a user-friendly interface for project management (internal team)
- Enable real-time updates and notifications
- Support team collaboration and reporting

## Technology Stack (Recommended)

### Frontend
- **Framework**: React with TypeScript
- **UI Library**: Tailwind CSS + shadcn/ui or Material-UI
- **State Management**: Zustand or Redux Toolkit
- **API Client**: Axios or Fetch API
- **Routing**: React Router

### Backend
- **Runtime**: Node.js with Express or Next.js (full-stack)
- **Language**: TypeScript
- **Database**: PostgreSQL or MongoDB
- **ORM/ODM**: Prisma or Mongoose
- **Authentication**: OAuth 2.0 (HubSpot integration)

### Integration
- **HubSpot API**: Official HubSpot API client
- **HubSpot Custom App Platform**: Build embedded UI in HubSpot
- **HubSpot CLI**: For building and deploying custom apps
- **Webhooks**: For real-time updates from HubSpot (subscribe to events)
- **Custom Workflow Actions**: Integrate with HubSpot automation
- **Custom Properties**: Extend HubSpot objects with project data

## Core Features

### Phase 1: Foundation (MVP) - **PRIORITY: Customer Dashboard**
1. **Customer-Facing Project Dashboard** ⭐ **HIGH PRIORITY**
   - Secure token-based access (no login required) - tokens are just for viewing, customers can't edit
   - Email-tied tokens for security: token is linked to customer's email address
   - Email link generation with unique tokens (e.g., `yoursite.com/track/abc123xyz`)
   - **No expiration** - customers can check status anytime, link works indefinitely
   - Real-time project status display (read-only)
   - Visual progress tracking (like Domino's tracker but more detailed)
   - Milestone timeline with completion status
   - Current phase/stage indicator
   - Estimated completion time
   - Recent activity feed
   - Mobile-responsive design
   - Auto-refresh for real-time updates

2. **Email Integration & Security**
   - Generate secure tracking links tied to customer email addresses
   - Email template system for sending project links
   - **Email verification**: Token is cryptographically tied to the customer's email
   - **No expiration**: Links work indefinitely so customers can check anytime
   - **Security**: Each token is unique and tied to a specific email/project combination
   - Optional: Verify email matches when accessing dashboard (additional security layer)

3. **Project Management (Internal)**
   - Create, read, update, delete projects
   - Project status tracking (Not Started, In Progress, Completed, On Hold)
   - Project metadata (name, description, start date, end date, owner)
   - Milestone creation and tracking
   - Phase/stage management

4. **Basic Internal Dashboard**
   - Project list view
   - Status overview
   - Simple filtering and search

5. **Authentication & Setup**
   - HubSpot OAuth integration (for internal team)
   - User authentication (internal only)
   - API key management

### Phase 2: Enhanced Features
6. **Task Management**
   - Create tasks within projects
   - Task assignment and due dates
   - Task status tracking
   - Task dependencies
   - Show task progress on customer dashboard (optional visibility toggle)

7. **HubSpot Integration** (Admin-Friendly)
   - **HubSpot Custom App** - Embed project tracker directly in HubSpot UI
   - **Sidebar Cards** - Show project status directly in HubSpot record pages
   - **Custom Workflow Actions** - Trigger project creation/updates from HubSpot workflows
   - Link projects to HubSpot deals/contacts (one-way: HubSpot → Project Tracker)
   - Create projects from HubSpot deals
   - Auto-generate customer dashboard links
   - Send tracking emails via HubSpot workflows
   - **One-click project creation** from HubSpot deals
   - **Bulk operations** - Create multiple projects from HubSpot
   - Note: Data flows one-way (HubSpot → Project Tracker). Admins update projects in the tracker, customers view status only.

8. **Enhanced Customer Dashboard Features**
   - File/document sharing (customer-visible deliverables)
   - Comments/notes section (customer can view updates)
   - Multiple project view (if customer has multiple projects)
   - Download project summary/report
   - Share dashboard link (optional)

9. **Timeline & Calendar**
   - Detailed project timeline view
   - Calendar integration
   - Milestone tracking with visual indicators
   - Gantt chart view (internal)

### Phase 3: Advanced Features
10. **Reporting & Analytics**
    - Project completion metrics
    - Time tracking
    - Resource allocation
    - Custom reports
    - Customer engagement metrics (dashboard views, time spent)

11. **Notifications**
    - Email notifications (status changes, milestone completions)
    - In-app notifications (internal team)
    - Status change alerts
    - Customer email updates (optional opt-in)

12. **Collaboration**
    - Team member assignment
    - Comments and notes (internal)
    - File attachments
    - Customer feedback collection

13. **Advanced Filtering & Views**
    - Custom filters
    - Saved views
    - Export functionality (CSV, PDF)

14. **Customer Dashboard Enhancements**
    - Custom branding per project/client
    - Multi-language support
    - Accessibility improvements
    - Dark mode option

## Project Structure

```
HubSpotProjectTracker/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API service layer
│   │   ├── store/           # State management
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   ├── public/
│   └── package.json
│
├── hubspot-app/             # HubSpot Custom App (embedded in HubSpot)
│   ├── src/
│   │   └── app/
│   │       ├── cards/       # Sidebar cards for deals/contacts
│   │       ├── workflows/   # Custom workflow actions
│   │       ├── settings/    # App settings page
│   │       └── *.hsmeta.json # HubSpot metadata files
│   └── package.json
│
├── backend/                  # Backend API (if separate)
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Data models
│   │   ├── services/        # Business logic
│   │   │   ├── hubspot/     # HubSpot integration services
│   │   │   └── sync/        # Data sync services
│   │   ├── middleware/      # Express middleware
│   │   └── config/          # Configuration files
│   └── package.json
│
├── shared/                   # Shared types/utilities
│   └── types/
│
├── .env.example             # Environment variables template
├── .gitignore
├── README.md
└── PLAN.md                  # This file
```

## Implementation Steps

### Step 1: Project Setup
- [ ] Initialize project structure
- [ ] Set up frontend (React + TypeScript)
- [ ] Set up backend (Node.js + Express) OR use Next.js full-stack
- [ ] Configure build tools and development environment
- [ ] Set up version control (Git)

### Step 2: Database & Models
- [ ] Design database schema
- [ ] Set up database (PostgreSQL/MongoDB)
- [ ] Create data models:
  - [ ] Project (with customer email, status, milestones, phases)
  - [ ] ProjectToken (secure tokens tied to customer email, no expiration)
    - token (unique identifier)
    - projectId (linked project)
    - customerEmail (tied to this email for security)
    - createdAt
    - isActive (can be revoked if needed)
  - [ ] Milestone (with completion status, dates)
  - [ ] Task (internal tasks)
  - [ ] ActivityLog (for customer dashboard feed)
  - [ ] User (internal team members)
- [ ] Set up database migrations

### Step 3: HubSpot Integration (Admin-Focused)
- [ ] Register HubSpot Custom App (not just API integration)
- [ ] Implement OAuth 2.0 flow
- [ ] Set up HubSpot API client
- [ ] Create service layer for HubSpot API calls
- [ ] **Build HubSpot Custom App UI** (embedded in HubSpot)
  - [ ] Sidebar card component for deal/contact records
  - [ ] Project creation form (accessible from HubSpot)
  - [ ] Quick actions (generate link, update status)
- [ ] **Create Custom Workflow Actions**
  - [ ] "Create Project" workflow action
  - [ ] "Update Project Status" workflow action
  - [ ] "Send Tracking Link" workflow action
- [ ] **Set up Custom Properties**
  - [ ] Project ID field on deals
  - [ ] Project Status field on deals
  - [ ] Tracking Link field on contacts
- [ ] Test API connectivity
- [ ] Test embedded app functionality

### Step 4: Backend API Development
- [ ] Set up authentication middleware (for internal routes)
- [ ] Create secure token generation system for customer links
  - [ ] Generate cryptographically secure random tokens
  - [ ] Tie tokens to customer email addresses
  - [ ] Store token-email-project relationship in database
  - [ ] No expiration logic needed
- [ ] Create public/guest endpoints (no auth required, token-based)
- [ ] Create project CRUD endpoints (internal)
- [ ] Create customer dashboard data endpoint (public with token validation)
  - [ ] Validate token exists and is active
  - [ ] Verify token is linked to correct project
  - [ ] Return project data (read-only)
- [ ] Create task management endpoints
- [ ] Implement data validation
- [ ] Add error handling
- [ ] Set up rate limiting for public endpoints

### Step 5: Frontend Development
- [ ] Set up routing (public and protected routes)
- [ ] **Build customer-facing dashboard** ⭐ **PRIORITY**
  - [ ] Create public dashboard route (`/track/:token`)
  - [ ] Design visual progress tracker component
  - [ ] Build milestone timeline component
  - [ ] Create status indicator with animations
  - [ ] Implement activity feed
  - [ ] Add real-time update mechanism (polling or WebSocket)
  - [ ] Make it mobile-responsive
- [ ] Create authentication pages (login, OAuth callback) - internal only
- [ ] Build internal dashboard layout
- [ ] Implement project list view (internal)
- [ ] Create project detail view (internal)
- [ ] Add project creation/edit forms (internal)
- [ ] Build link generation UI (internal - for sending to customers)

### Step 6: Integration & Testing
- [ ] Connect frontend to backend API
- [ ] Test HubSpot integration end-to-end
- [ ] Implement error handling and loading states
- [ ] Add input validation
- [ ] Write unit tests

### Step 7: Deployment Preparation
- [ ] Set up environment variables
- [ ] Configure production build
- [ ] Set up CI/CD pipeline
- [ ] Prepare deployment documentation

## Environment Variables Needed

```env
# HubSpot
HUBSPOT_CLIENT_ID=
HUBSPOT_CLIENT_SECRET=
HUBSPOT_REDIRECT_URI=
HUBSPOT_APP_ID=              # Custom app ID (for embedded app)
HUBSPOT_DEVELOPER_API_KEY=    # For server-side API calls

# Database
DATABASE_URL=

# Server
PORT=3000
NODE_ENV=development

# Authentication
JWT_SECRET=
SESSION_SECRET=

# Customer Dashboard
TOKEN_SECRET=              # For generating secure customer access tokens (tied to email)
# Note: Tokens don't expire - customers can check status anytime
```

## API Endpoints (Proposed)

### Public Endpoints (Customer-Facing - Token-Based)
- `GET /api/public/track/:token` - Get project status for customer (no auth required, token tied to email)
- `GET /api/public/track/:token/activity` - Get activity feed for customer dashboard
- `GET /api/public/track/:token/milestones` - Get milestone timeline
- Note: Tokens are validated against stored email, no expiration check needed

### Authentication (Internal)
- `POST /api/auth/hubspot` - Initiate HubSpot OAuth
- `GET /api/auth/callback` - OAuth callback handler
- `POST /api/auth/logout` - Logout user

### Projects (Internal)
- `GET /api/projects` - List all projects (requires auth)
- `GET /api/projects/:id` - Get project details (requires auth)
- `POST /api/projects` - Create new project (requires auth)
- `PUT /api/projects/:id` - Update project (requires auth)
- `DELETE /api/projects/:id` - Delete project (requires auth)

### Project Tokens (Internal)
- `POST /api/projects/:id/tokens` - Generate customer tracking link (requires customer email)
- `GET /api/projects/:id/tokens` - List all tokens for a project
- `PUT /api/tokens/:tokenId` - Update token (active status only, no expiry)
- `DELETE /api/tokens/:tokenId` - Revoke token (if needed for security)

### Milestones (Internal)
- `GET /api/projects/:projectId/milestones` - Get milestones
- `POST /api/projects/:projectId/milestones` - Create milestone
- `PUT /api/milestones/:id` - Update milestone
- `DELETE /api/milestones/:id` - Delete milestone

### Tasks (Internal)
- `GET /api/projects/:projectId/tasks` - Get tasks for a project
- `POST /api/projects/:projectId/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Activity Log (Internal)
- `POST /api/projects/:projectId/activity` - Log activity (auto or manual)
- `GET /api/projects/:projectId/activity` - Get activity log

### HubSpot Integration
- `POST /api/hubspot/create-project` - Create project from HubSpot deal (one-way)
- `GET /api/hubspot/link/:dealId` - Link existing project to HubSpot deal

### HubSpot Custom App Endpoints
- `GET /api/hubspot/app` - HubSpot app UI (embedded)
- `POST /api/hubspot/workflow/create-project` - Custom workflow action: Create project
- `POST /api/hubspot/workflow/update-status` - Custom workflow action: Update status
- `POST /api/hubspot/workflow/send-link` - Custom workflow action: Send tracking link
- `GET /api/hubspot/card/:recordType/:recordId` - Sidebar card data

## Next Steps

1. **Decide on Architecture**: 
   - Separate frontend/backend or Next.js full-stack?
   - Database choice (PostgreSQL vs MongoDB)?

2. **Set Up Development Environment**:
   - Install dependencies
   - Configure development tools
   - Set up local database

3. **HubSpot App Registration**:
   - Create HubSpot developer account
   - Register new app
   - Get OAuth credentials

4. **Start with MVP**:
   - Begin with Phase 1 features
   - Get basic project tracking working
   - Then iterate with additional features

## Token Security Approach

### How Tokens Work
1. **Token Generation**: When admin creates a project and assigns a customer email, a unique token is generated
   - Token is a long, random, cryptographically secure string (e.g., `a7f3b9c2d8e1f4g5h6i7j8k9l0m1n2o3`)
   - Token is stored in database with: `projectId`, `customerEmail`, `isActive`
   - No expiration date stored

2. **Token Usage**: Customer receives email with link like `yoursite.com/track/a7f3b9c2d8e1f4g5h6i7j8k9l0m1n2o3`
   - Customer clicks link anytime (no expiration)
   - Backend validates token exists and is active
   - Returns project data for that specific token/project

3. **Security Features**:
   - **Email-tied**: Token is associated with customer email (stored in database)
   - **Unique per project**: Same customer, different project = different token
   - **Not guessable**: Long random tokens prevent brute force
   - **Revocable**: Admin can deactivate token if needed (security breach, etc.)
   - **Optional email verification**: Can add step to verify email matches token (extra security)

4. **Why No Expiration?**
   - Customers should be able to check project status anytime
   - Project might last months/years - expiration would be inconvenient
   - Email-tied tokens provide sufficient security for read-only access
   - Admin can always revoke if needed

## Customer Dashboard Design (Domino's-Style but Enhanced)

### Visual Elements
1. **Progress Bar/Tracker**
   - Overall project completion percentage
   - Visual progress indicator (animated)
   - Current phase highlighted

2. **Milestone Timeline**
   - Horizontal timeline showing all milestones
   - Completed milestones (green checkmark)
   - Current milestone (highlighted, animated)
   - Upcoming milestones (grayed out)
   - Each milestone shows:
     - Name/description
     - Target date
     - Completion date (if done)
     - Status icon

3. **Status Card**
   - Current status: "In Progress", "Review", "Testing", etc.
   - Large, clear status indicator
   - Estimated completion date
   - Days remaining (if applicable)

4. **Activity Feed**
   - Recent updates and changes
   - Timestamp for each activity
   - "Last updated: X minutes ago" indicator

5. **Project Details**
   - Project name
   - Description
   - Start date
   - Expected completion date
   - Contact information

### User Experience
- **No login required** - just click the link
- **Mobile-first design** - works perfectly on phones
- **Real-time updates** - auto-refreshes every 30-60 seconds
- **Clean, simple interface** - easy to understand at a glance
- **Professional appearance** - builds trust

## Admin Considerations - Making It Easy for HubSpot Admins

### Critical Admin-Friendly Features

1. **HubSpot Custom App Integration** ⭐ **ESSENTIAL**
   - **Embedded UI in HubSpot**: Admins should be able to manage projects without leaving HubSpot
   - **Sidebar Cards**: Show project status directly on deal/contact record pages
   - **No separate login required**: Use HubSpot OAuth, admins stay logged into HubSpot
   - **Familiar HubSpot UI patterns**: Match HubSpot's design language for consistency

2. **Custom Workflow Actions** ⭐ **HIGH PRIORITY**
   - **"Create Project from Deal"**: One-click project creation from HubSpot workflows
   - **"Update Project Status"**: Change project status from HubSpot automation
   - **"Send Tracking Link"**: Automatically email customer tracking links via HubSpot workflows
   - **"Sync Project to Deal"**: Update deal properties when project status changes
   - Admins can set up automation without coding

3. **Custom Properties on Deals/Contacts** (Optional)
   - Store tracking link on contact record for easy access
   - Project ID on deal for reference
   - Note: One-way sync only (HubSpot → Project Tracker). Projects are managed in the tracker, not synced back to HubSpot.

4. **Minimal Setup Required**
   - **One-time OAuth connection**: Admin connects once, all users benefit
   - **Auto-sync enabled by default**: Projects automatically link to deals/contacts
   - **Pre-configured templates**: Default milestone templates for common project types
   - **Smart defaults**: Sensible defaults for all settings

5. **Bulk Operations**
   - Create multiple projects from HubSpot deal lists
   - Bulk update project statuses
   - Bulk generate and send tracking links
   - Import projects from HubSpot deals via CSV

6. **HubSpot Workflow Integration**
   - Trigger project creation when deal reaches certain stage
   - Send tracking link email when project is created
   - All configurable through HubSpot's visual workflow builder
   - Note: One-way flow - HubSpot triggers project creation, but project updates happen in the tracker

7. **Data Flow Strategy**
   - **One-way sync**: HubSpot → Project Tracker (when creating/linking projects)
   - **Project management**: Admins update projects directly in the tracker
   - **Customer access**: Customers view status via secure link (read-only)
   - No sync back to HubSpot needed - projects are managed independently

8. **Permission Management**
   - Respect HubSpot user permissions
   - Only users with deal/contact access can see related projects
   - Super admins can configure app settings
   - Regular users can view/update projects they have access to

9. **Error Handling & Notifications**
   - Clear error messages in HubSpot UI when sync fails
   - Email notifications to admins for sync issues
   - Retry mechanism for failed syncs
   - Logging visible in HubSpot app settings

10. **Documentation & Onboarding**
    - In-app tooltips and help text
    - Quick start guide for HubSpot admins
    - Video tutorials for common workflows
    - Example workflow templates

### Technical Implementation Notes

- **Use HubSpot Developer Platform 2025.2+**: Latest features and best practices
- **Custom App Structure**: Follow HubSpot's recommended file structure (`src/app/`)
- **Webhooks over Polling**: Subscribe to HubSpot events for real-time updates
- **HTTPS Endpoints**: All custom workflow actions must use secure endpoints
- **OAuth Token Management**: Handle token refresh automatically
- **Rate Limiting**: Respect HubSpot API rate limits (100 requests/10 seconds)

### Admin Workflow Examples

**Example 1: Creating a Project from a Deal**
1. Admin views deal in HubSpot
2. Clicks "Create Project" button in sidebar card
3. Project is created and linked to deal automatically
4. Tracking link is generated and saved to contact's custom property
5. Admin can send link via HubSpot email or workflow

**Example 2: Automated Workflow**
1. Deal reaches "Closed Won" stage
2. HubSpot workflow triggers "Create Project" custom action
3. Project is created with default milestones
4. Tracking link is generated
5. HubSpot workflow sends email to contact with tracking link
6. Project is now managed in the tracker (no sync back to HubSpot)

**Example 3: Status Updates**
1. Team member updates project milestone in project tracker
2. Customer dashboard automatically shows updated status (real-time)
3. Customer can refresh their tracking link to see latest progress
4. No HubSpot sync needed - projects are managed independently

## Questions to Consider

- Should this be a web app, desktop app, or both? **Web app (primary) + HubSpot Custom App (embedded)**
- Do you need real-time collaboration features? **For internal team, yes**
- What level of HubSpot integration is required? **Full Custom App with embedded UI, workflow actions, and property sync**
- Who is the target user? **HubSpot admins (primary) + Internal team (management) + Customers (view-only)**
- What reporting/analytics are most important? **Project status, customer engagement, HubSpot deal correlation**
- **Should customers be able to comment/request changes?** (Future consideration)
- **Should the dashboard show internal tasks or only customer-facing milestones?** (Recommend: milestones only for customers)
- **How should project creation be triggered?** (Manual from HubSpot UI + Automated via workflows)
- **Should projects auto-create when deals close?** (Yes, via workflow automation)

---

## Potential Challenges & Solutions for Admins

### Challenge 1: Complex Setup
**Problem**: Admins might find initial setup overwhelming
**Solution**: 
- Provide a setup wizard that guides through OAuth connection
- Auto-detect HubSpot account settings
- Pre-populate default configurations
- One-click "Enable All Features" option

### Challenge 2: Data Flow Clarity
**Problem**: Admins might be confused about where to update projects
**Solution**:
- Clear documentation: Projects are managed in the tracker (not synced back to HubSpot)
- HubSpot is used for creating/linking projects, not for ongoing updates
- Simple rule: Create in HubSpot, manage in Tracker, view as Customer

### Challenge 3: Workflow Automation Complexity
**Problem**: Admins might not know how to set up workflows
**Solution**:
- Provide pre-built workflow templates
- Include step-by-step guides with screenshots
- Offer example workflows for common scenarios
- Create video tutorials

### Challenge 4: Performance with Large Datasets
**Problem**: Slow loading when syncing many projects/deals
**Solution**:
- Implement pagination and lazy loading
- Use webhooks instead of polling
- Cache frequently accessed data
- Show loading states and progress indicators

### Challenge 5: Token Security Without Expiration
**Problem**: How to secure tokens that don't expire
**Solution**:
- **Email-tied tokens**: Each token is cryptographically linked to customer email
- **Unique per project/email**: Same customer, different project = different token
- **Revocation capability**: Admins can revoke tokens if needed (e.g., security breach)
- **Optional email verification**: Can add email confirmation step for extra security
- **Token format**: Use cryptographically secure random tokens (not guessable)

### Challenge 6: Custom Property Management
**Problem**: Admins might not want to clutter HubSpot with new properties
**Solution**:
- Make custom properties optional
- Group related properties in a property group
- Allow admins to choose which properties to sync
- Provide property cleanup tools

## Success Metrics for Admin Experience

- **Time to First Project**: < 5 minutes from app installation
- **Setup Completion Rate**: > 90% of admins complete setup
- **Workflow Adoption**: > 60% of admins use custom workflow actions
- **Support Tickets**: < 5% of admins need support during setup
- **Feature Discovery**: Admins find and use key features without training

---

**Last Updated**: January 26, 2026
**Status**: Planning Phase
