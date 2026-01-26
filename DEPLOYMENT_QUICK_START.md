# Quick Deployment Guide

## Step 1: Push to GitHub

```bash
# If you haven't already, initialize git and commit
git init
git add .
git commit -m "Initial commit: HubSpot Project Tracker"

# Create a new repository on GitHub (github.com/new)
# Then connect and push:
git remote add origin https://github.com/YOUR_USERNAME/HubSpotProjectTracker.git
git branch -M main
git push -u origin main
```

## Step 2: Set Up DigitalOcean App Platform

1. **Go to DigitalOcean**: https://cloud.digitalocean.com/apps
2. **Click "Create App"**
3. **Connect GitHub**:
   - Select "GitHub" as source
   - Authorize DigitalOcean
   - Select your repository: `HubSpotProjectTracker`
   - Select branch: `main`
   - Enable "Autodeploy" ✓

4. **Configure App**:
   - **Name**: `hubspot-project-tracker` (or your choice)
   - **Region**: Choose closest to you
   - **Type**: Web Service
   - **Build Command**: `npm run build`
   - **Run Command**: `npm start`
   - **Environment**: Node.js (auto-detected)

5. **Add Database**:
   - Click "Add Resource" → "Database"
   - Choose PostgreSQL
   - **Name**: `hubspot-project-tracker-db`
   - **Plan**: Basic ($15/month) or higher
   - This will automatically add `DATABASE_URL` to your environment variables

6. **Set Environment Variables**:
   Click "Edit" next to Environment Variables and add:
   
   ```env
   # HubSpot (get from HUBSPOT_SETUP.md)
   HUBSPOT_CLIENT_ID=your_client_id
   HUBSPOT_CLIENT_SECRET=your_client_secret
   HUBSPOT_REDIRECT_URI=https://your-app-name.ondigitalocean.app/api/auth/hubspot/callback
   HUBSPOT_APP_ID=your_app_id
   HUBSPOT_DEVELOPER_API_KEY=your_api_key
   
   # Database (auto-added when you add database component)
   # DATABASE_URL will be automatically set
   
   # Server
   NODE_ENV=production
   PORT=8080
   
   # Authentication (generate secure random strings)
   JWT_SECRET=your_jwt_secret_here
   SESSION_SECRET=your_session_secret_here
   
   # Customer Dashboard
   TOKEN_SECRET=your_token_secret_here
   
   # App URL (update after deployment with your actual URL)
   NEXT_PUBLIC_APP_URL=https://your-app-name.ondigitalocean.app
   ```

7. **Review & Deploy**:
   - Review all settings
   - Click "Create Resources"
   - DigitalOcean will build and deploy your app
   - Wait 5-10 minutes for first deployment

## Step 3: Run Database Migrations

After first deployment:

1. **Option A - Using DigitalOcean Console**:
   - Go to your app → Settings → Console
   - Run: `npx prisma migrate deploy`
   - Or: `npx prisma db push`

2. **Option B - From Local Machine**:
   ```bash
   # Get DATABASE_URL from DigitalOcean dashboard
   # Add to local .env file
   DATABASE_URL="postgresql://user:password@host:port/db?sslmode=require"
   
   # Run migration
   npx prisma migrate deploy
   ```

## Step 4: Update Environment Variables

After deployment, you'll get a URL like: `https://hubspot-project-tracker-xyz123.ondigitalocean.app`

1. Update `NEXT_PUBLIC_APP_URL` with your actual URL
2. Update `HUBSPOT_REDIRECT_URI` with your actual callback URL
3. Redeploy (or wait for auto-deploy if you edited in DigitalOcean)

## Step 5: Verify Deployment

1. Visit your app URL
2. Test customer dashboard: `https://your-app-url/track/[test-token]`
3. Check logs in DigitalOcean dashboard if issues

## Troubleshooting

### Build Fails
- Check build logs in DigitalOcean
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Database Connection Issues
- Verify `DATABASE_URL` is set correctly
- Check database firewall allows App Platform IPs
- Ensure migrations have run

### App Crashes
- Check runtime logs
- Verify all environment variables are set
- Ensure Prisma Client is generated (`npm run db:generate`)

## Next Steps

1. Set up HubSpot integration (see `HUBSPOT_SETUP.md`)
2. Create your first project
3. Test end-to-end workflow
4. Set up custom domain (optional)

---

**Note**: The `.do/app.yaml` file is included but DigitalOcean's web UI is easier for first-time setup. You can use the YAML file later for infrastructure-as-code.
