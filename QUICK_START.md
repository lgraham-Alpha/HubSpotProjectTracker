# Quick Start Guide 🚀

Get up and running in 5 minutes!

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add at minimum:
- `DATABASE_URL` - Your PostgreSQL connection string
- `NEXT_PUBLIC_APP_URL` - Your app URL (e.g., `http://localhost:3000`)

For HubSpot integration, also add:
- `HUBSPOT_DEVELOPER_API_KEY` - Your HubSpot API key
- `HUBSPOT_CLIENT_ID` - OAuth client ID (optional)
- `HUBSPOT_CLIENT_SECRET` - OAuth client secret (optional)

## 3. Set Up Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push
```

## 4. Start Development Server

```bash
npm run dev
```

## 5. Access Admin Dashboard

Open: **http://localhost:3000/admin**

## 6. Create Your First Project

1. Click **"+ Create Project"**
2. Fill in:
   - Project Name: "Test Project"
   - Customer Email: "test@example.com"
   - Description: (optional)
3. Click **"Create Project"**

## 7. Generate Tracking Link

1. Click **"Get Tracking Link"** on your project
2. Link is copied to clipboard!
3. Open it in a new tab to see the customer dashboard

## 8. Add Milestones

1. Click **"View Details"** on your project
2. Click **"+ Add Milestone"**
3. Fill in:
   - Milestone Name: "Design Phase"
   - Description: (optional)
   - Target Date: (optional)
4. Click **"Create Milestone"**
5. Update status via the dropdown

## 🎉 You're Done!

Your customer can now:
- Visit the tracking link you sent
- See real-time project status
- View milestone progress
- See risk indicators
- Check activity feed

## Next Steps

- **HubSpot Integration**: See `HUBSPOT_SETUP.md`
- **Deployment**: See `DEPLOYMENT_QUICK_START.md`
- **API Documentation**: See `BUILT_TODAY.md`

## Troubleshooting

### Database Connection Error
- Check your `DATABASE_URL` in `.env`
- Make sure PostgreSQL is running
- Verify database exists

### Port Already in Use
- Change `PORT` in `.env` or kill the process using port 3000

### Prisma Errors
- Run `npm run db:generate` again
- Check your database connection
- Verify schema is correct
