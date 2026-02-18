import { NextResponse } from 'next/server'
import { getHubSpotOAuthUrl } from '@/lib/hubspot/oauth'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const state = searchParams.get('state') || undefined

    const authUrl = getHubSpotOAuthUrl(state)

    return NextResponse.json({ authUrl })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to generate OAuth URL', details: error.message },
      { status: 500 }
    )
  }
}
