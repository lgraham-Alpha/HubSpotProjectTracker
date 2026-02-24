import { NextResponse } from 'next/server'
import { getProjectTrackingRecord, projectTrackingToProjectAndTasks } from '@/lib/hubspot/project-tracking'

/**
 * GET /api/hubspot/project-tracking/[id]
 * Get a single Project tracking record from HubSpot with all its tasks (properties).
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const recordId = params.id
    if (!recordId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    const record = await getProjectTrackingRecord(recordId)
    const projectWithTasks = projectTrackingToProjectAndTasks(record)

    return NextResponse.json(projectWithTasks)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    if (msg.includes('404')) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    console.error('HubSpot project-tracking get error:', error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
