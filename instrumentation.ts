/**
 * Runs once when the Node server starts. Starts the HubSpot project sync every 60 seconds.
 * Only runs when HUBSPOT_DEVELOPER_API_KEY is set. Uses an in-flight guard to skip if previous run is still going.
 */

const SYNC_INTERVAL_MS = 60_000
const FIRST_SYNC_DELAY_MS = 10_000

let syncInFlight = false

async function runSync() {
  if (syncInFlight) return
  if (!process.env.HUBSPOT_DEVELOPER_API_KEY) return
  syncInFlight = true
  try {
    const { runHubSpotProjectSync } = await import('./lib/hubspot/sync-projects')
    await runHubSpotProjectSync()
  } catch (err) {
    console.error('[HubSpot sync]', err)
  } finally {
    syncInFlight = false
  }
}

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  if (!process.env.HUBSPOT_DEVELOPER_API_KEY) return

  setTimeout(() => {
    runSync()
    setInterval(runSync, SYNC_INTERVAL_MS)
  }, FIRST_SYNC_DELAY_MS)
}
