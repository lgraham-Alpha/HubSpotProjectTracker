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

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── public/       # Public endpoints (customer-facing)
│   ├── track/             # Customer dashboard pages
│   └── layout.tsx        # Root layout
├── lib/                   # Utilities and shared code
│   ├── db.ts             # Prisma client
│   └── utils/            # Helper functions
├── prisma/                # Database schema
│   └── schema.prisma
└── components/            # React components (to be created)
```

## Key Features

- **Customer Dashboard**: Secure token-based access (no login required)
- **Email-tied Tokens**: Tokens are linked to customer email addresses
- **No Expiration**: Customers can check status anytime
- **Real-time Updates**: Auto-refreshing project status
- **HubSpot Integration**: One-way sync from HubSpot to tracker

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
