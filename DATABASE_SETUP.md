# Database setup (required after deploy)

**Error you may see:** `The table public.Project does not exist in the current database` (Prisma P2021).

**Cause:** The app is connected to the database, but the Prisma schema has never been applied, so no tables exist.

**Fix:** Run the schema once against your production database.

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

After `prisma db push` succeeds, the tables exist and "Error: Failed to create project" / "table does not exist" will stop.
