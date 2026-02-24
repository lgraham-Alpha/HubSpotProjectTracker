import { NextResponse } from 'next/server'
import { listProjectTrackingRecords, projectTrackingToProjectAndTasks } from '@/lib/hubspot/project-tracking'

/**
 * GET /api/hubspot/project-tracking
 * List Project tracking records from HubSpot (project + tasks as properties).
 * Query: limit (default 20), after (pagination cursor)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 100)
    const after = searchParams.get('after') || undefined

    const { results, nextAfter } = await listProjectTrackingRecords({ limit, after })

    const projects = results.map((record) => projectTrackingToProjectAndTasks(record))

    return NextResponse.json({
      projects,
      paging: nextAfter ? { next: { after: nextAfter } } : null,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to list HubSpot projects'
    console.error('HubSpot project-tracking list error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
