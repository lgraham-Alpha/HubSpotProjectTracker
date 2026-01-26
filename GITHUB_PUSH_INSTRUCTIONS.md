# Push to GitHub - Quick Instructions

I can't directly push to GitHub due to authentication requirements, but here's exactly what to do:

## Option 1: Run the Script (Easiest)

```bash
cd /Users/lucasgraham/Projects/HubSpotProjectTracker
./push-to-github.sh
```

Then follow the instructions it prints.

## Option 2: Manual Commands

Run these commands in your terminal:

```bash
cd /Users/lucasgraham/Projects/HubSpotProjectTracker

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: HubSpot Project Tracker with Next.js, Prisma, and customer dashboard"

# Create a new repository on GitHub first: https://github.com/new
# Then connect and push (replace YOUR_USERNAME):
git remote add origin https://github.com/YOUR_USERNAME/HubSpotProjectTracker.git
git branch -M main
git push -u origin main
```

## After Pushing to GitHub

1. **Go to DigitalOcean**: https://cloud.digitalocean.com/apps
2. **Click "Create App"**
3. **Connect GitHub** and select your repository
4. **DigitalOcean will auto-detect Next.js** - just confirm settings
5. **Add PostgreSQL database** component
6. **Set environment variables** (from `.env.example`)
7. **Deploy!**

See `DEPLOYMENT_QUICK_START.md` for detailed DigitalOcean setup.
