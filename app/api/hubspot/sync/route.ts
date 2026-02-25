import { NextResponse } from 'next/server'
import { runHubSpotProjectSync } from '@/lib/hubspot/sync-projects'

/**
 * GET/POST /api/hubspot/sync
 * Run HubSpot Project tracking sync once. Returns counts.
 * The app also runs this automatically every minute via instrumentation.
 */
export async function GET() {
  return runSync()
}

export async function POST() {
  return runSync()
}

async function runSync() {
  try {
    const result = await runHubSpotProjectSync()
    return NextResponse.json(result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('HubSpot sync error:', error)
    return NextResponse.json(
      { error: message, projectsCreated: 0, projectsUpdated: 0, milestonesCreated: 0, milestonesUpdated: 0 },
      { status: 500 }
    )
  }
}
