# HubSpot Requirements: What You Need vs What's Automatic

## TL;DR

**Minimum HubSpot Setup (5 minutes):**
- Get an API key (Private App) OR set up OAuth
- That's it! You can use the tracker standalone.

**Optional HubSpot Setup (if you want automation):**
- Create custom properties (to store project links in HubSpot)
- Set up workflow actions (to auto-create projects from deals)

**What the Tracker Handles Automatically:**
- ✅ Creating projects
- ✅ Generating tracking links
- ✅ Updating HubSpot properties (if you create them)
- ✅ All project management logic

**Customer tracking link (view only):** The link you send to customers is **read-only**. They can only view project and milestone status. All edits (including marking milestones complete) happen in the **admin portal** or via **HubSpot** (workflow actions / custom variables like `project_status`).

---

## Option 1: Standalone (No HubSpot Required) ✅

**You can use the tracker completely independently!**

### What You Do:
1. Use the admin dashboard at `/admin`
2. Create projects manually
3. Generate tracking links
4. Send links to customers

### HubSpot Setup Required:
- ❌ **Nothing!** Works standalone.

---

## Option 2: Basic HubSpot Integration (Recommended)

### What You Do in HubSpot (5 minutes):

#### Step 1: Get API Access
Choose ONE of these:

**Option A: Private App (Easiest)**
1. In HubSpot: **Settings** → **Integrations** → **Private Apps**
2. Click **Create a private app**
3. Name it "Project Tracker"
4. Grant scopes:
   - `crm.objects.contacts.read`
   - `crm.objects.contacts.write`
   - `crm.objects.deals.read`
   - `crm.objects.deals.write`
5. Copy the **API Key**
6. Add to `.env`: `HUBSPOT_DEVELOPER_API_KEY=your_key_here`

**Option B: OAuth (More Complex)**
1. Go to [HubSpot Developer Portal](https://developers.hubspot.com/)
2. Create a Custom App
3. Set up OAuth (see `HUBSPOT_SETUP.md` for details)
4. Add credentials to `.env`

### What the Tracker Does Automatically:
- ✅ Can create projects from HubSpot deals/contacts
- ✅ Can fetch customer info from HubSpot
- ✅ Can update HubSpot records (if you create custom properties)

**That's it!** You can now:
- Call `POST /api/hubspot/create-project` with a deal ID
- The tracker creates the project and generates a tracking link
- Optionally updates HubSpot with the project info

---

## Option 3: Full HubSpot Integration (Optional)

### What You Do in HubSpot (15-20 minutes):

#### Step 1: Create Custom Properties (Optional but Recommended)

**On Deals:**
1. **Settings** → **Properties** → **Deal properties**
2. Create property: **"Project ID"** (Single-line text)
3. Create property: **"Project Status"** (Single-line text)

**On Contacts:**
1. **Settings** → **Properties** → **Contact properties**
2. Create property: **"Project Tracking Link"** (URL)

**Why?** So the tracker can automatically store project info back in HubSpot.

#### Step 2: Set Up Workflow Actions (Optional)

1. In HubSpot Developer Portal, go to your app → **Workflow actions**
2. Create workflow action:
   - **Name**: "Create Project"
   - **Endpoint**: `https://your-app-url/api/hubspot/workflow/create-project`
   - **Method**: POST

**Why?** So HubSpot workflows can automatically create projects when deals are created.

### What the Tracker Does Automatically:
- ✅ When you create a project via HubSpot, it automatically:
  - Creates the project in the tracker
  - Generates a tracking token
  - Updates the HubSpot deal with `project_id` and `project_status`
  - Updates the HubSpot contact with `project_tracking_link`
- ✅ All the logic is handled in the tracker code

---

## Summary: What's Required vs Optional

### ✅ REQUIRED (Minimum to Use Tracker)
- **Nothing!** Works standalone via admin dashboard

### ✅ REQUIRED (For HubSpot Integration)
- **API Key or OAuth credentials** (5 minutes)
  - Private App API key (easiest)
  - OR OAuth Client ID/Secret

### ⭐ RECOMMENDED (For Better Integration)
- **Custom Properties** (10 minutes)
  - `project_id` on deals
  - `project_status` on deals
  - `project_tracking_link` on contacts
  - **Why?** So project info appears in HubSpot records

### 🎯 OPTIONAL (For Automation)
- **Workflow Actions** (15 minutes)
  - "Create Project" workflow action
  - **Why?** Auto-create projects when deals are created

---

## What the Tracker Handles Automatically

### ✅ Automatic Features (No HubSpot Setup Needed)
- Project creation
- Token generation
- Milestone management
- Customer dashboard
- Activity logging
- Risk calculation
- All business logic

### ✅ Automatic HubSpot Updates (If You Create Custom Properties)
When you create a project via HubSpot integration:
- ✅ Updates deal with `project_id`
- ✅ Updates deal with `project_status`
- ✅ Updates contact with `project_tracking_link`
- ✅ Fetches deal/contact data from HubSpot
- ✅ Handles all API calls automatically

**You don't need to write any code!** Just create the properties in HubSpot, and the tracker handles the rest.

---

## Quick Decision Guide

### "I just want to track projects"
→ **No HubSpot setup needed!** Use `/admin` dashboard.

### "I want to create projects from HubSpot deals"
→ **Get API key** (5 min) → Use `POST /api/hubspot/create-project`

### "I want project info to show in HubSpot records"
→ **Get API key** (5 min) + **Create custom properties** (10 min)

### "I want HubSpot workflows to auto-create projects"
→ **Get API key** (5 min) + **Create custom properties** (10 min) + **Set up workflow action** (15 min)

---

## Example: Minimal Setup

1. **In HubSpot** (2 minutes):
   - Create Private App
   - Copy API key

2. **In Tracker** (1 minute):
   - Add `HUBSPOT_DEVELOPER_API_KEY` to `.env`

3. **Done!** You can now:
   ```bash
   curl -X POST http://localhost:3000/api/hubspot/create-project \
     -H "Content-Type: application/json" \
     -d '{
       "dealId": "123456789",
       "customerEmail": "customer@example.com",
       "projectName": "Website Redesign"
     }'
   ```

The tracker automatically:
- Creates the project
- Generates tracking link
- Fetches deal info from HubSpot
- (If custom properties exist) Updates HubSpot with project info

---

## Bottom Line

**Most of the work is in the tracker!** 

HubSpot setup is minimal:
- **Standalone**: 0 minutes
- **Basic integration**: 5 minutes (just get API key)
- **Full integration**: 20 minutes (API key + properties + workflows)

The tracker handles all the complex logic automatically. 🚀
