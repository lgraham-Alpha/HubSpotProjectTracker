-- Run once against your existing database (e.g. DigitalOcean SQL console or: psql $DATABASE_URL -f prisma/add_hubspot_sync_columns.sql)
-- Adds columns required for HubSpot Project tracking sync. Safe to run once (IF NOT EXISTS).

-- Project: allow lookup by HubSpot project tracking record ID
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "hubspotProjectTrackingId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Project_hubspotProjectTrackingId_key" ON "Project"("hubspotProjectTrackingId");
CREATE INDEX IF NOT EXISTS "Project_hubspotProjectTrackingId_idx" ON "Project"("hubspotProjectTrackingId");

-- Milestone: store HubSpot task property name for sync upserts
ALTER TABLE "Milestone" ADD COLUMN IF NOT EXISTS "sourceId" TEXT;
CREATE INDEX IF NOT EXISTS "Milestone_projectId_sourceId_idx" ON "Milestone"("projectId", "sourceId");
