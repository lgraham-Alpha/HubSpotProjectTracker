# Run the App

Node/npm aren’t available in Cursor’s agent environment, so run these commands **in your own terminal** (where Node is installed).

## 1. Install dependencies

```bash
cd /Users/lucasgraham/Projects/HubSpotProjectTracker
npm install
```

## 2. Set up the database

Edit `.env` and set `DATABASE_URL` to your PostgreSQL connection string (e.g. local Postgres or a free DB from [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app)).

Then:

```bash
npm run db:generate
npm run db:push
```

## 3. Start the dev server

```bash
npm run dev
```

## 4. Open the app

- **Admin:** http://localhost:3000/admin  
- **Home:** http://localhost:3000  

Create a project and use “Get Tracking Link” to open the customer dashboard.

---

**If `npm` is not found:** install Node.js from [nodejs.org](https://nodejs.org) or use a version manager like `nvm` or `fnm`.
