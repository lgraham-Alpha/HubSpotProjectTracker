#!/bin/bash

# Setup script for pushing to GitHub

echo "🚀 Setting up Git repository..."

# Initialize git (if not already done)
if [ ! -d ".git" ]; then
  git init
  echo "✅ Git repository initialized"
else
  echo "ℹ️  Git repository already exists"
fi

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: HubSpot Project Tracker with Next.js, Prisma, and customer dashboard

Features:
- Customer-facing dashboard with token-based access
- Milestone tracking with prerequisites and risk calculation
- Auto-refresh every 5 minutes
- HubSpot integration ready
- DigitalOcean App Platform deployment ready"

echo ""
echo "✅ Files committed!"
echo ""
echo "📝 Next steps:"
echo "1. Create a new repository on GitHub: https://github.com/new"
echo "2. Run these commands (replace YOUR_USERNAME with your GitHub username):"
echo ""
echo "   git remote add origin https://github.com/YOUR_USERNAME/HubSpotProjectTracker.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Then set up DigitalOcean App Platform (see DEPLOYMENT_QUICK_START.md)"
