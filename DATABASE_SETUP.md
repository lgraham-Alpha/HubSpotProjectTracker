# Database setup (required after deploy)

**Error you may see:** `The table public.Project does not exist in the current database` (Prisma P2021).

**Cause:** The app is connected to the database, but the Prisma schema has never been applied, so no tables exist.

**Does the app have “Run SQL”?** No. The app code doesn’t include a SQL runner. If DigitalOcean shows a “Run SQL” or “Console” for your database in their dashboard, you can paste `prisma/schema.sql` there. For App Platform app databases, that option isn’t always available.

---

## Quick fix so it “just works” (about 5 minutes)

1. Go to **[neon.tech](https://neon.tech)** → Sign up → **New project** → copy the **connection string**.
2. In **DigitalOcean** → your app → **Settings** → **Environment Variables** → set **`DATABASE_URL`** to that Neon connection string (replace the current value). Save.
3. Set **Run Command** to: `npx prisma db push && npm start` (if it isn’t already). Save.
4. **Redeploy** the app (e.g. trigger a new deploy or push a commit).

On the next start, the app will run `prisma db push` against Neon (where the user can create tables), create the tables, then start. No manual SQL, no permission fixes. After that, creating and listing projects will work.

You can switch back to a DigitalOcean database later once you have a way to run the schema (e.g. DO adds a Run SQL for app DBs, or you use a standalone Managed Database and run the SQL there).

---

**What the app does:** On every start it runs `npx prisma db push` then `npm start`. So once the database user can create tables, the next deploy creates them automatically.

**Other options (if you want to stay on the current DO database):**

### Option 1: Run the schema SQL manually (if you get any “Run SQL” or admin access)

If DigitalOcean (or support) gives you a way to run SQL against your app database, run the contents of **`prisma/schema.sql`** in this repo. It creates the same tables and enums as `prisma db push`. One run is enough; after that the app will work.

### Option 2: DigitalOcean app database (if you have schema permission)

1. Give your DB user permission to create objects in `public` (one-time). Connect as a user that can run `ALTER SCHEMA` (e.g. admin), then:
   ```sql
   ALTER SCHEMA public OWNER TO "dev-db-869550";
   ```
   (Use your actual database username if different.)

2. In **App Platform → your app → Console**, run:
   ```bash
   npx prisma db push
   ```

### Option 3: Use Neon or Supabase for the app database

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
