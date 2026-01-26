# HubSpot Setup Guide

This guide walks you through everything you need to configure in HubSpot to integrate with the Project Tracker.

## Overview

You'll need to set up:
1. **HubSpot Developer Account** - To create apps and get API access
2. **Custom App** - For OAuth and API access
3. **Custom Properties** (Optional) - To store project links on deals/contacts
4. **Custom Workflow Actions** (Optional) - For automation
5. **Webhooks** (Optional) - For real-time updates

---

## Step 1: Create HubSpot Developer Account

1. Go to [HubSpot Developer Portal](https://developers.hubspot.com/)
2. Sign in with your HubSpot account (or create one)
3. Navigate to **Apps** in the developer portal

---

## Step 2: Create a Custom App

### 2.1 Create New App

1. Click **Create app**
2. Fill in app details:
   - **App name**: "Project Tracker" (or your preferred name)
   - **Description**: "Track project status and provide customer dashboards"
   - **App logo**: Upload a logo (optional)
3. Click **Create app**

### 2.2 Configure OAuth Settings

1. In your app, go to **Auth** tab
2. Set up OAuth 2.0:
   - **Redirect URL**: `https://your-app-url.ondigitalocean.app/api/auth/hubspot/callback`
     - For local development: `http://localhost:3000/api/auth/hubspot/callback`
   - **Scopes**: Select the following scopes:
     - ✅ `crm.objects.contacts.read`
     - ✅ `crm.objects.contacts.write`
     - ✅ `crm.objects.deals.read`
     - ✅ `crm.objects.deals.write`
     - ✅ `crm.objects.custom.read` (if using custom properties)
     - ✅ `crm.objects.custom.write` (if using custom properties)
     - ✅ `automation.workflows.read` (if using workflows)
     - ✅ `automation.workflows.write` (if using workflows)
     - ✅ `crm.schemas.contacts.read` (if creating custom properties)
     - ✅ `crm.schemas.contacts.write` (if creating custom properties)
     - ✅ `crm.schemas.deals.read` (if creating custom properties)
     - ✅ `crm.schemas.deals.write` (if creating custom properties)

3. Click **Save**

### 2.3 Get Your Credentials

1. In the **Auth** tab, you'll see:
   - **Client ID** - Copy this to `HUBSPOT_CLIENT_ID` in your `.env`
   - **Client Secret** - Copy this to `HUBSPOT_CLIENT_SECRET` in your `.env`
2. **App ID** - Found in the app overview, copy to `HUBSPOT_APP_ID`

### 2.4 Get Developer API Key (Optional - for server-side calls)

1. Go to **Settings** → **Integrations** → **Private Apps** (in your HubSpot account, not developer portal)
2. Click **Create a private app**
3. Name it: "Project Tracker API"
4. Grant the same scopes as above
5. Click **Create app**
6. Copy the **API Key** to `HUBSPOT_DEVELOPER_API_KEY` in your `.env`

**Note**: Private apps are simpler for server-side API calls, but OAuth is better for user-specific access.

---

## Step 3: Create Custom Properties (Optional but Recommended)

These properties allow you to store project information directly on HubSpot records.

### 3.1 Create Properties on Deals

1. In HubSpot, go to **Settings** → **Properties** → **Deal properties**
2. Click **Create property**
3. Create these properties:

#### Property 1: Project ID
- **Label**: "Project ID"
- **Internal name**: `project_id` (auto-generated)
- **Field type**: Single-line text
- **Group**: Create new group "Project Tracker" (optional)
- Click **Create**

#### Property 2: Project Status
- **Label**: "Project Status"
- **Internal name**: `project_status`
- **Field type**: Single-line text
- **Group**: "Project Tracker"
- Click **Create**

### 3.2 Create Properties on Contacts

1. Go to **Settings** → **Properties** → **Contact properties**
2. Click **Create property**

#### Property: Tracking Link
- **Label**: "Project Tracking Link"
- **Internal name**: `project_tracking_link`
- **Field type**: URL
- **Group**: "Project Tracker"
- Click **Create**

---

## Step 4: Set Up Custom Workflow Actions (Optional)

If you want to trigger project creation from HubSpot workflows:

### 4.1 Create Workflow Action Endpoints

Your app needs to expose these endpoints:
- `POST /api/hubspot/workflow/create-project`
- `POST /api/hubspot/workflow/update-status`
- `POST /api/hubspot/workflow/send-link`

### 4.2 Register Workflow Actions in HubSpot

1. In your HubSpot app (Developer Portal), go to **Workflow actions**
2. Click **Create workflow action**
3. Configure each action:

#### Action: Create Project
- **Action name**: "Create Project"
- **Description**: "Create a new project in Project Tracker"
- **Endpoint URL**: `https://your-app-url.ondigitalocean.app/api/hubspot/workflow/create-project`
- **HTTP method**: POST
- **Input fields**:
  - Deal name (text)
  - Customer email (email)
  - Project description (text, optional)
- **Output fields**:
  - Project ID (text)
  - Tracking Link (URL)

#### Action: Update Project Status
- **Action name**: "Update Project Status"
- **Endpoint URL**: `https://your-app-url.ondigitalocean.app/api/hubspot/workflow/update-status`
- **Input fields**:
  - Project ID (text)
  - New Status (dropdown: Not Started, In Progress, Completed, On Hold)

#### Action: Send Tracking Link
- **Action name**: "Send Tracking Link"
- **Endpoint URL**: `https://your-app-url.ondigitalocean.app/api/hubspot/workflow/send-link`
- **Input fields**:
  - Project ID (text)
  - Contact email (email)

---

## Step 5: Set Up Webhooks (Optional)

For real-time updates when deals/contacts change:

### 5.1 Subscribe to Events

1. In your HubSpot app, go to **Webhooks**
2. Click **Create webhook subscription**
3. Configure:
   - **Event type**: Deal property change / Contact property change
   - **Webhook URL**: `https://your-app-url.ondigitalocean.app/api/hubspot/webhooks`
   - **HTTP method**: POST

### 5.2 Verify Webhook

HubSpot will send a verification request. Your endpoint needs to:
1. Respond to `GET` requests with the challenge
2. Validate the signature

---

## Step 6: Install App in HubSpot Account

### 6.1 Test Installation

1. In your app (Developer Portal), go to **Test** tab
2. Click **Install app**
3. Select your HubSpot account
4. Authorize the app
5. You should see it installed in your HubSpot account

### 6.2 Production Installation

For production:
1. Submit your app for review (if making it public)
2. Or install directly in your account (for private use)

---

## Step 7: Environment Variables Summary

Add these to your `.env` file:

```env
# HubSpot OAuth (from Step 2.3)
HUBSPOT_CLIENT_ID=your_client_id_here
HUBSPOT_CLIENT_SECRET=your_client_secret_here
HUBSPOT_REDIRECT_URI=https://your-app-url.ondigitalocean.app/api/auth/hubspot/callback

# HubSpot App (from Step 2.3)
HUBSPOT_APP_ID=your_app_id_here

# HubSpot API Key (from Step 2.4 - optional)
HUBSPOT_DEVELOPER_API_KEY=your_api_key_here
```

---

## Step 8: Test the Integration

### 8.1 Test OAuth Flow

1. Visit: `https://your-app-url.ondigitalocean.app/api/auth/hubspot`
2. You should be redirected to HubSpot for authorization
3. After authorizing, you should be redirected back

### 8.2 Test API Calls

Use the HubSpot API client in your app to:
- Fetch deals
- Create/update contacts
- Read custom properties

### 8.3 Test Workflow Actions

1. Create a test workflow in HubSpot
2. Add your custom workflow action
3. Trigger the workflow
4. Verify the action executes correctly

---

## Common Issues & Solutions

### Issue: "Invalid redirect URI"
**Solution**: Make sure the redirect URI in your app matches exactly (including http/https, trailing slashes, etc.)

### Issue: "Insufficient scopes"
**Solution**: Add the required scopes in your app's Auth settings and re-authorize

### Issue: "API rate limit exceeded"
**Solution**: HubSpot has rate limits (100 requests per 10 seconds). Implement rate limiting in your app.

### Issue: "Custom property not found"
**Solution**: Make sure you've created the property in HubSpot and granted the `crm.schemas.*.read` scope

---

## Next Steps

1. ✅ Set up OAuth and get credentials
2. ✅ Create custom properties (if using)
3. ✅ Test API connectivity
4. ✅ Build HubSpot Custom App UI (if embedding in HubSpot)
5. ✅ Set up workflow actions (if using automation)
6. ✅ Configure webhooks (if using real-time updates)

---

## Resources

- [HubSpot Developer Documentation](https://developers.hubspot.com/docs/api/overview)
- [HubSpot Custom Apps Guide](https://developers.hubspot.com/docs/apps)
- [HubSpot API Reference](https://developers.hubspot.com/docs/api/crm/understanding-the-crm)
- [HubSpot Webhooks Guide](https://developers.hubspot.com/docs/api/webhooks)

---

**Last Updated**: January 26, 2026
