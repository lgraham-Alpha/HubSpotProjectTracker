# HubSpot Project Tracker

A comprehensive project tracking system integrated with HubSpot. Customers can click a link in their email to view a detailed, real-time project status dashboard (similar to Domino's pizza tracker but more comprehensive).

## Tech Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Deployment**: DigitalOcean App Platform
- **Integration**: HubSpot API

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (local or DigitalOcean Managed Database)
- HubSpot developer account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in your environment variables in `.env`

4. Set up the database:
   ```bash
   # Generate Prisma Client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Run the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Quick Start Guide

### Admin Dashboard
Visit `http://localhost:3000/admin` to:
- Create projects
- Generate tracking links
- Manage milestones
- View project details

### Customer Dashboard
Customers visit their tracking link (e.g., `http://localhost:3000/track/[token]`) to:
- View project status
- See milestone timeline
- Check risk indicators
- View activity feed

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   │   ├── projects/     # Project management endpoints
│   │   ├── milestones/   # Milestone endpoints
│   │   ├── hubspot/      # HubSpot integration
│   │   └── public/       # Public endpoints (customer-facing)
│   ├── track/             # Customer dashboard pages
│   └── layout.tsx        # Root layout
├── lib/                   # Utilities and shared code
│   ├── db.ts             # Prisma client
│   ├── hubspot/          # HubSpot API client & OAuth
│   ├── utils/            # Helper functions
│   └── validations/      # Zod schemas
├── prisma/                # Database schema
│   └── schema.prisma
└── components/            # React components
```

## Key Features

- **Admin Dashboard**: Full project management UI at `/admin`
- **Customer Dashboard**: Secure token-based access (no login required)
- **Email-tied Tokens**: Tokens are linked to customer email addresses
- **No Expiration**: Customers can check status anytime
- **Real-time Updates**: Auto-refreshing project status (every 5 minutes)
- **HubSpot Integration**: One-way sync from HubSpot to tracker
- **RESTful API**: Complete API for programmatic access
- **Milestone Management**: Track progress with prerequisites and risk indicators

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:migrate` - Create database migration

## Setup Guides

- **HubSpot Setup**: See `HUBSPOT_SETUP.md` for configuring HubSpot integration
- **Quick Deployment**: See `DEPLOYMENT_QUICK_START.md` for step-by-step DigitalOcean setup
- **Detailed Deployment**: See `DEPLOYMENT.md` for comprehensive deployment guide
- **Project Plan**: See `PLAN.md` for overall project architecture and features

## Deploy to DigitalOcean

1. **Push to GitHub**:
   ```bash
   ./setup-git.sh  # Or run git commands manually
   git remote add origin https://github.com/YOUR_USERNAME/HubSpotProjectTracker.git
   git branch -M main
   git push -u origin main
   ```

2. **Set up DigitalOcean**:
   - Go to https://cloud.digitalocean.com/apps
   - Click "Create App" → Connect GitHub
   - Select your repository
   - DigitalOcean will auto-detect Next.js
   - Add PostgreSQL database
   - Set environment variables (see `.env.example`)
   - Deploy!

See `DEPLOYMENT_QUICK_START.md` for detailed instructions.

## License

MIT
