# Features to Incorporate from Previous Project

Based on `claude-project.md`, here are valuable features from your previous Alpha onboarding tracker that we should add:

## ✅ Already Similar
- Magic link/token-based access (we have this)
- Read-only customer view (we have this)
- HubSpot integration (we have this)
- Auto-refresh (we should add this)
- Progress calculation (we have basic version)

## 🎯 Should Add

### 1. **Milestone Prerequisites/Dependencies** ⭐ HIGH PRIORITY
**What it does**: Milestones can depend on other milestones being completed first.

**Example from previous project:**
- Database Review requires: Processing Info Form + Menu Upload completed
- Installation requires: Database Accepted + Site Inspection + Processing App Signed

**How to add:**
- Add `prerequisiteMilestoneIds` field to Milestone model (array of milestone IDs)
- Add logic to check if prerequisites are met before allowing milestone to proceed
- Show "blocked" status if prerequisites aren't met

### 2. **Risk Calculation** ⭐ HIGH PRIORITY
**What it does**: Green/Yellow/Red indicators based on timeline urgency and prerequisites.

**Logic from previous project:**
- **Green**: Prerequisites met and scheduled in future
- **Yellow**: Prerequisites unmet, >7 days out OR unmet but not urgent
- **Red**: Prerequisites unmet and ≤48 hours out

**How to add:**
- Add `riskLevel` field to Milestone (computed field)
- Create `computeScheduleRisk()` function
- Display risk indicators in UI

### 3. **Next Blocking Items** ⭐ HIGH PRIORITY
**What it does**: Identifies what's currently blocking progress.

**How to add:**
- Create `nextBlockingItems()` function
- Show "Waiting on: [list of blocking items]" in UI
- Helps customers understand what they need to do next

### 4. **Enhanced Status System**
**Previous project had:**
- Document statuses: `Incomplete`, `Not Provided`, `In Review`, `Changes Requested`, `Completed`
- Timeline statuses: `Incomplete`, `In Progress`, `Scheduled`, `Completed`, `Yes`, `No`

**Our current statuses:**
- Milestone: `PENDING`, `IN_PROGRESS`, `COMPLETED`, `BLOCKED`
- Task: `TODO`, `IN_PROGRESS`, `DONE`, `BLOCKED`

**Should add:**
- `SCHEDULED` status for milestones (when date is set but not started)
- `IN_REVIEW` status (for items being reviewed)
- `CHANGES_REQUESTED` status (for items needing customer action)

### 5. **Document Tracking** (Optional)
**What it does**: Track document uploads and review status.

**From previous project:**
- Documents have: title, helper text, status, uploads[], reviewNotes
- Statuses: Incomplete, Not Provided, In Review, Changes Requested, Completed

**Should we add?**
- Could add as a separate model or as part of Tasks
- Useful if customers need to upload documents

### 6. **Better UI/UX Patterns**
**From previous project:**
- Dark theme (zinc color palette)
- Orange accent color
- Status badges with consistent styling
- Risk chips (Green/Yellow/Red)
- Better timeline visualization

**Our current UI:**
- Light theme
- Basic styling

**Should update:**
- Consider dark theme option
- Add risk indicators
- Improve badge styling
- Better timeline visualization

### 7. **Auto-Refresh**
**From previous project:**
- Auto-refreshes every 5 minutes

**Should add:**
- Add client-side polling to refresh data
- Show "Last updated: X minutes ago"

## Implementation Priority

### Phase 1 (High Value, Easy)
1. ✅ Auto-refresh (5 minute polling)
2. ✅ Prerequisite system (add field + logic)
3. ✅ Risk calculation (add computed field + display)

### Phase 2 (High Value, Medium Effort)
4. ✅ Next blocking items (add function + UI)
5. ✅ Enhanced status system (add new statuses)
6. ✅ Better UI styling (dark theme, badges)

### Phase 3 (Optional)
7. Document tracking (if needed)
8. Advanced timeline visualization

## Next Steps

1. Update Prisma schema to add prerequisites
2. Create utility functions for risk calculation
3. Update UI to show risk indicators
4. Add auto-refresh to customer dashboard
5. Add "blocking items" section to dashboard
