# Database setup (required after deploy)

**Error you may see:** `The table public.Project does not exist in the current database` (Prisma P2021).

**Cause:** The app is connected to the database, but the Prisma schema has never been applied, so no tables exist.

**What the app does:** On every start, the app runs `npx prisma db push` then `npm start`. So once your database user can create tables (see below), the next deploy or restart will create them automatically. If `prisma db push` fails (e.g. permission denied), the app will not start and you’ll see the error in the logs.

**Fix:** Ensure your database user can create tables in the `public` schema, then deploy or restart.

### Option 1: DigitalOcean app database (if you have schema permission)

1. Give your DB user permission to create objects in `public` (one-time). Connect as a user that can run `ALTER SCHEMA` (e.g. admin), then:
   ```sql
   ALTER SCHEMA public OWNER TO "dev-db-869550";
   ```
   (Use your actual database username if different.)

2. In **App Platform → your app → Console**, run:
   ```bash
   npx prisma db push
   ```

### Option 2: Use Neon or Supabase for the app database

1. Create a free project at [neon.tech](https://neon.tech) or [supabase.com](https://supabase.com) and copy the Postgres connection string.
2. In **App Platform → Settings → Environment Variables**, set `DATABASE_URL` to that connection string.
3. Redeploy, then in **Console** run:
   ```bash
   npx prisma db push
   ```

After `prisma db push` succeeds (or runs automatically on start), the tables exist and "Error: Failed to create project" / "table does not exist" will stop.

**If you configured the app in the DigitalOcean UI** (not from `.do/app.yaml`), set the app’s **Run Command** to:
```bash
npx prisma db push && npm start
```
Then save and redeploy.
