import { NextResponse } from 'next/server'
import { exchangeCodeForTokens } from '@/lib/hubspot/oauth'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      )
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code)

    // TODO: Store tokens in database associated with user
    // For now, we'll just return them
    // In production, you'd want to:
    // 1. Store accessToken and refreshToken in database
    // 2. Associate with user session
    // 3. Implement token refresh logic

    return NextResponse.json({
      success: true,
      message: 'OAuth successful',
      // In production, don't return tokens directly
      // Instead, set them in a secure HTTP-only cookie or session
    })
  } catch (error: any) {
    console.error('OAuth callback error:', error)
    return NextResponse.json(
      { error: 'OAuth callback failed', details: error.message },
      { status: 500 }
    )
  }
}
