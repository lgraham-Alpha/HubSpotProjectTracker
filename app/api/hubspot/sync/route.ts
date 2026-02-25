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
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/6aca2622-a87d-49d8-98d0-5e9ec39c4f46',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ebb1e4'},body:JSON.stringify({sessionId:'ebb1e4',location:'app/api/hubspot/sync/route.ts:catch',message:'Sync error captured',data:{message},timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    console.error('HubSpot sync error:', error)
    return NextResponse.json(
      { error: message, projectsCreated: 0, projectsUpdated: 0, milestonesCreated: 0, milestonesUpdated: 0 },
      { status: 500 }
    )
  }
}
