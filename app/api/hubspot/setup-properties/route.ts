import { NextResponse } from 'next/server'
import { createProjectTrackerProperties } from '@/lib/hubspot/setup-properties'

/**
 * POST /api/hubspot/setup-properties
 * Creates Project Tracker custom properties in HubSpot (deals: project_id, project_status; contacts: project_tracking_link).
 * Safe to call multiple times; existing properties are reported as "exists".
 */
export async function POST() {
  try {
    const results = await createProjectTrackerProperties('')
    const hasError = results.some(r => r.status === 'error')
    return NextResponse.json(
      { message: 'Setup complete', results },
      { status: hasError ? 207 : 200 }
    )
  } catch (error: any) {
    console.error('HubSpot setup-properties error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to create HubSpot properties' },
      { status: 500 }
    )
  }
}
