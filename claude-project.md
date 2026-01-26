# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **read-only customer onboarding tracker** for "Alpha" (restaurant POS/payment system). It's a simple FastAPI app that fetches onboarding status from HubSpot and displays it to customers via magic links (no login required).

**Architecture**: FastAPI (Python) + Jinja2 templates + HubSpot API integration

**Original Prototype**: The `index.html` file contains the original React prototype that this implementation is based on. The production app (`app.py` + templates) preserves the exact UI/UX and business logic from that prototype.

## Running the Application

### Local Development:

```bash
# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env and add your HUBSPOT_API_KEY

# Run the app
python app.py
# or
uvicorn app:app --reload
```

Visit: `http://localhost:8000`

### Viewing the Original Prototype:

The original React prototype is preserved in `index.html`. Open it directly in a browser to see the demo with mock data.

## Architecture

### FastAPI Application

**Main App** (`app.py`):
- FastAPI web server
- HubSpot API integration (search deals by token)
- Business logic ported from prototype
- Jinja2 template rendering

**Templates** (`templates/`):
- `onboarding.html` - Main customer tracker (preserves prototype UI exactly)
- `error.html` - Error page

**Static Assets** (`static/`):
- `alpha-wolf.png` - Logo

### Original Prototype Structure

The prototype in `index.html` is structured as:

1. **Configuration** (lines 24-55): Brand config, badge styles, risk styles
2. **Utilities** (lines 57-99): Helper functions (`cx`, `Badge`, `RiskChip`, `formatDT`, `daysUntil`)
3. **Business Logic** (lines 101-222):
   - `computeScheduleRisk`: Calculates timeline risk (Green/Yellow/Red) based on prerequisites and scheduled dates
   - `percentCompleteTimeline`: Progress calculation
   - `getPrereqs`: Defines prerequisite dependencies between milestones
   - `nextBlockingItems`: Identifies what's currently blocking progress
4. **UI Components** (lines 227-402): `SectionCard`, `DocumentRow`, `FileList`, `Modal`, `TimelineItem`
5. **Main App** (lines 407-967): Root component with all state management

### State Management

All state is managed in the `App` component via `useState`, initialized from `initialData` (lines 132-178). State structure:

```javascript
{
  header: { restaurantName, contactName, lastUpdatedLabel },
  onboarding: { overallStatus, onHoldReason },
  documents: {
    processingInfoForm: { title, helper, status, linkUrl },
    processingAppSigned: { title, helper, status },
    menuUpload: { title, helper, status, uploads[], reviewNotes },
    reportUpload: { title, helper, status, uploads[], reviewNotes }
  },
  timeline: [
    { id, title, status, allowed[], scheduledAt? }
  ]
}
```

### Key Business Rules

**Document Statuses**: `Incomplete`, `Not Provided`, `In Review`, `Changes Requested`, `Completed`

**Timeline Statuses**: `Incomplete`, `In Progress`, `Scheduled`, `Completed`, `Yes`, `No`

**Risk Calculation** (`computeScheduleRisk` at line 104):
- **Green**: Prerequisites met and scheduled in future
- **Yellow**: Prerequisites unmet, >7 days out OR unmet but not urgent
- **Red**: Prerequisites unmet and ≤48 hours out

**Prerequisites** (`getPrereqs` at line 183):
- Database Review requires: Processing Info Form + Menu Upload completed
- Site Inspection requires: Database Draft completed
- Installation requires: Database Accepted + Site Inspection + Processing App Signed
- Training requires: Installation scheduled/completed + Database Accepted
- Go-Live requires: Installation + Training + Processing App Signed

## Prototype-Specific Behaviors

Since there's no backend, the following are simulated with demo buttons:

- **File uploads**: Uses browser file API but only stores metadata (name, size, timestamp) in state
- **Form completion**: Opens link and marks complete immediately
- **Processing App Signed**: Manual "Mark Completed" button (would be HubSpot-driven)
- **Document review**: "Accept (demo)" and "Changes Requested (demo)" buttons simulate internal team actions
- **Date change requests**: Logs to console instead of creating HubSpot tasks
- **Schedule editing**: Directly modifies state (would require coordinator approval in production)

## Styling

Uses Tailwind CSS via CDN with a dark theme (zinc color palette) and orange accent color. All colors are defined inline using Tailwind utility classes.

**Design system**:
- Background: `bg-zinc-950` (dark)
- Cards: `bg-zinc-900/40` with `ring-1 ring-zinc-800`
- Accent: Orange (`bg-orange-600`, `text-orange-200`, etc.)
- Status badges: Defined in `badgeStyle` (line 34) and `riskStyle` (line 50)

## Modifying the Prototype

### Adding a New Document Type

1. Add to `initialData.documents` (line 142)
2. Add `<DocumentRow>` in the App's JSX (around line 637-800)
3. Update `getPrereqs` if it blocks any milestones (line 183)

### Adding a New Timeline Milestone

1. Add to `initialData.timeline` array (line 169)
2. Define prerequisites in `getPrereqs` (line 183)
3. Ensure `allowed` statuses are appropriate

### Changing Risk Calculation

Modify `computeScheduleRisk` function (line 104). Current thresholds:
- Red: ≤48 hours with unmet prereqs
- Yellow: ≤7 days with unmet prereqs

## Current Implementation (Phase 1)

**What's Built:**
- ✅ Read-only tracker (customers view status via magic link)
- ✅ HubSpot integration (fetches real-time data from Deals)
- ✅ Prerequisite tracking and risk calculation (ported from prototype)
- ✅ Beautiful UI (exact replica of prototype design)
- ✅ Auto-refresh every 5 minutes

**What's NOT Built Yet (Future Phases):**
- ❌ File uploads (customers just see status, no uploading)
- ❌ Authentication (using magic links instead)
- ❌ Internal coordinator dashboard (coordinators update HubSpot directly)
- ❌ Email sending (send magic links manually for now)
- ❌ Webhooks (app pulls from HubSpot when customer visits page)

## Key Files

**Production App:**
- `app.py` - Main FastAPI application (300 lines)
- `templates/onboarding.html` - Customer tracker page
- `requirements.txt` - Python dependencies
- `HUBSPOT_SETUP.md` - Guide to configure HubSpot custom properties
- `README.md` - Full setup and deployment guide

**Reference:**
- `index.html` - Original prototype with all business logic
- `CLAUDE.md` - This file

## HubSpot Setup

See `HUBSPOT_SETUP.md` for complete instructions. Summary:

**Required Custom Deal Properties (20 total):**
- Core: tracker_secret_token, onboarding_status, contact_name
- Documents: 4 status fields (processing form, app signed, menu, report)
- Timeline: 7 milestones × 2-3 fields each (status + scheduled date)

**Magic Link Workflow:**
1. Coordinator creates Deal in HubSpot
2. Generate UUID, save to `tracker_secret_token` field
3. Send email to customer: `https://tracker.yourdomain.com/o/{token}`
4. Customer clicks → sees their onboarding status
5. Coordinator updates HubSpot → customer refreshes page → sees updates

## Deployment

**Recommended**: DigitalOcean App Platform ($5/month)
- Push code to GitHub
- Connect to DigitalOcean
- Auto-deploy on push
- Config in `.do/app.yaml`

**Alternative**: Render (free tier, sleeps after 15 min)

See README.md for full deployment instructions.
