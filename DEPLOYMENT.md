# DigitalOcean App Platform Deployment Guide

## Overview

This guide walks you through deploying the HubSpot Project Tracker to DigitalOcean App Platform.

## Prerequisites

- DigitalOcean account
- GitHub/GitLab repository with your code
- PostgreSQL database (DigitalOcean Managed Database recommended)

## Step 1: Set Up DigitalOcean Managed PostgreSQL Database

1. Log in to DigitalOcean Control Panel
2. Navigate to **Databases** → **Create Database Cluster**
3. Choose:
   - **PostgreSQL** as database engine
   - **Version**: Latest stable (14+)
   - **Plan**: Basic ($15/month minimum) or higher
   - **Region**: Choose closest to your app
   - **Database name**: `hubspot_project_tracker`
4. Click **Create Database Cluster**
5. Once created, note the **Connection String** (you'll need this for `DATABASE_URL`)

## Step 2: Create App on DigitalOcean App Platform

1. Navigate to **Apps** → **Create App**
2. Connect your GitHub/GitLab repository:
   - Select your repository
   - Choose the branch (usually `main` or `master`)
   - Click **Next**

## Step 3: Configure App Settings

### Basic Settings
- **App Name**: `hubspot-project-tracker` (or your preferred name)
- **Region**: Same as your database
- **Type**: Web Service

### Build & Run Settings

**Build Command:**
```bash
npm run build
```

**Run Command:**
```bash
npm start
```

**Environment**: Node.js

**Buildpack**: Auto-detect (or select Node.js)

### Environment Variables

Add all variables from your `.env.example`:

```env
# HubSpot
HUBSPOT_CLIENT_ID=your_client_id
HUBSPOT_CLIENT_SECRET=your_client_secret
HUBSPOT_REDIRECT_URI=https://your-app-name.ondigitalocean.app/api/auth/callback
HUBSPOT_APP_ID=your_app_id
HUBSPOT_DEVELOPER_API_KEY=your_api_key

# Database (use connection string from Step 1)
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# Server
NODE_ENV=production
PORT=8080

# Authentication
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here

# Customer Dashboard
TOKEN_SECRET=your_token_secret_here

# App URL (your DigitalOcean app URL)
NEXT_PUBLIC_APP_URL=https://your-app-name.ondigitalocean.app
```

**Important Notes:**
- `DATABASE_URL` should use the connection string from your Managed Database
- `PORT` should be `8080` (DigitalOcean App Platform default)
- `NEXT_PUBLIC_APP_URL` should be your app's URL (you'll get this after deployment)

## Step 4: Connect Database

1. In the App configuration, go to **Resources** tab
2. Click **Add Resource** → **Database**
3. Select your PostgreSQL database cluster created in Step 1
4. This will automatically add the database connection to your app

## Step 5: Run Database Migrations

After first deployment, you need to run Prisma migrations:

### Option 1: Using DigitalOcean Console (Recommended)

1. Go to your app in DigitalOcean
2. Navigate to **Settings** → **Console**
3. Run:
   ```bash
   npx prisma migrate deploy
   ```
   Or if using db push:
   ```bash
   npx prisma db push
   ```

### Option 2: Using Local Machine

1. Set `DATABASE_URL` in your local `.env` to point to DigitalOcean database
2. Run:
   ```bash
   npx prisma migrate deploy
   ```

## Step 6: Deploy

1. Review all settings
2. Click **Create Resources**
3. DigitalOcean will:
   - Build your app
   - Deploy it
   - Provide you with a URL (e.g., `https://your-app-name.ondigitalocean.app`)

## Step 7: Post-Deployment

### Update Environment Variables

1. Update `NEXT_PUBLIC_APP_URL` with your actual app URL
2. Update `HUBSPOT_REDIRECT_URI` with your actual callback URL
3. Redeploy if needed

### Verify Deployment

1. Visit your app URL
2. Test the customer dashboard: `https://your-app-url/track/[test-token]`
3. Check logs in DigitalOcean dashboard for any errors

## Step 8: Set Up Custom Domain (Optional)

1. In your app settings, go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. DigitalOcean will automatically provision SSL certificate

## Continuous Deployment

DigitalOcean App Platform automatically deploys when you push to your connected branch. To disable auto-deploy:

1. Go to **Settings** → **App-Level Settings**
2. Toggle **Auto Deploy** off

## Monitoring & Logs

- **Logs**: View in **Runtime Logs** tab
- **Metrics**: View in **Metrics** tab
- **Alerts**: Set up in **Alerts** section

## Scaling

1. Go to **Settings** → **App-Level Settings**
2. Adjust:
   - **Instance Size**: Based on traffic
   - **Instance Count**: For horizontal scaling
   - **Auto-scaling**: Enable if needed

## Troubleshooting

### Build Failures
- Check build logs in DigitalOcean dashboard
- Verify all dependencies are in `package.json`
- Ensure Node.js version is compatible

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check database firewall rules allow App Platform IPs
- Ensure database cluster is running

### Runtime Errors
- Check runtime logs
- Verify all environment variables are set
- Ensure Prisma migrations have run

## Cost Estimation

- **App Platform**: $5-12/month (Basic plan)
- **Managed PostgreSQL**: $15/month (Basic plan)
- **Total**: ~$20-30/month minimum

## Next Steps

1. Set up HubSpot OAuth with your production URL
2. Test end-to-end workflow
3. Set up monitoring and alerts
4. Configure backup strategy for database

---

**Last Updated**: January 26, 2026
