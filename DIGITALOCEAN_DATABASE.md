# Make the app work on DigitalOcean (DO-only)

Use a **standalone** DigitalOcean Managed Database and give your app user permission to create tables. Then the app’s existing run command will create tables on deploy.

---

## Step 1: Create a standalone PostgreSQL database

1. In DigitalOcean go to **Databases** (main menu, not inside your app).
2. Click **Create Database Cluster**.
3. Choose **PostgreSQL**, pick a plan (e.g. Basic \$15/mo or Dev Database if available).
4. Pick the same region as your app. Create the cluster.
5. Wait until the cluster is ready. Open it and go to **Users & Databases**.
6. Note the **connection details**: host, port, database name, and the **default user** (often `doadmin`) and its password.

---

## Step 2: Create an app user and give it the schema

1. In the same cluster go to **Users & Databases**.
2. **Add a new user** (e.g. name: `appuser`, password: choose a strong one). Note the username and password.
3. You need to run one SQL command as the **admin** user (`doadmin`) so that `appuser` can create tables.  
   From your **local machine** (with `psql` installed), connect as the admin user using the connection string from the cluster (replace user/password with `doadmin` and its password):

   ```bash
   psql "postgresql://doadmin:ADMIN_PASSWORD@YOUR_DB_HOST:25060/defaultdb?sslmode=require" -c "ALTER SCHEMA public OWNER TO \"appuser\";"
   ```

   **Important:** Replace `appuser` with the **exact** username of the database user your app will use (the one in `DATABASE_URL`). That user must already exist (the one you created in step 2). If you get `ERROR: role "X" does not exist`, the name in quotes is wrong — use the real username from your cluster’s Users list (e.g. `appuser`, not `apps`).

4. Create a database for the app (optional): in the cluster, **Databases** tab, add a database (e.g. `appdb`). If you use it, connect to that database and run the same `ALTER SCHEMA` with the **same** username (the app user, e.g. `appuser`).

---

## Step 3: Point the app at this database

1. In the cluster, open **Connection details** (or the connection string for the **app user**).
2. Build the connection string for the app user:
   - User: `appuser` (or whatever you created)
   - Password: that user’s password
   - Host, port, database: from the cluster
   - Add `?sslmode=require`
   - Example: `postgresql://appuser:APPUSER_PASSWORD@db-postgresql-xxx.ondigitalocean.com:25060/defaultdb?sslmode=require`
3. In **App Platform** → your app → **Settings** → **Environment Variables**:
   - Set **`DATABASE_URL`** to this connection string (replace any existing `DATABASE_URL` or `${...}` reference).
4. Set **Run Command** to: `npx prisma db push && npm start`. Save.
5. **Redeploy** the app.

On startup the app will run `prisma db push` against this DB; because `appuser` owns `public`, tables will be created and the app will work.

---

## Step 4: Allow the app to reach the database

- In the database cluster, **Settings** → **Trusted Sources**, add the App Platform outbound IPs or allow all (e.g. `0.0.0.0/0`) for development so the app can connect.

---

## Summary

- **Standalone** Managed Database (from the main Databases tab) gives you an admin user (`doadmin`) that can run `ALTER SCHEMA public OWNER TO "appuser"`.
- After that one-time SQL, the app user can create tables; `npx prisma db push` in the run command will succeed and the app works on DO only.
