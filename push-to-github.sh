#!/bin/bash

# Script to initialize git and prepare for GitHub push
# Run this script: ./push-to-github.sh

set -e

echo "🚀 Setting up Git repository for GitHub..."

# Remove any existing .git if it has permission issues
if [ -d ".git" ]; then
  echo "Removing existing .git directory..."
  rm -rf .git
fi

# Initialize git
echo "Initializing git repository..."
git init

# Add all files
echo "Adding files..."
git add .

# Create initial commit
echo "Creating initial commit..."
git commit -m "Initial commit: HubSpot Project Tracker

Features:
- Next.js 14 with TypeScript
- Customer dashboard with token-based access
- Milestone tracking with prerequisites and risk calculation
- Auto-refresh every 5 minutes
- Blocking items detection
- HubSpot integration ready
- DigitalOcean App Platform deployment ready"

echo ""
echo "✅ Git repository initialized and committed!"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Create a new repository on GitHub:"
echo "   https://github.com/new"
echo "   - Name: HubSpotProjectTracker"
echo "   - Don't initialize with README (we already have one)"
echo ""
echo "2. Connect and push (replace YOUR_USERNAME):"
echo "   git remote add origin https://github.com/YOUR_USERNAME/HubSpotProjectTracker.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Then set up DigitalOcean App Platform (see DEPLOYMENT_QUICK_START.md)"
