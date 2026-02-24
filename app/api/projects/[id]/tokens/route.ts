import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateSecureToken } from '@/lib/utils/token'
import { logActivity } from '@/lib/utils/activity'

/** Base URL for tracking links: prefer env, then request origin, then localhost. */
function getBaseUrl(request: Request): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
  }
  try {
    return new URL(request.url).origin
  } catch {
    return 'http://localhost:3000'
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const baseUrl = getBaseUrl(request)

    const project = await prisma.project.findUnique({
      where: { id: params.id },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // One active token per project: reuse if exists
    const existingToken = await prisma.projectToken.findFirst({
      where: {
        projectId: params.id,
        isActive: true,
      },
    })

    if (existingToken) {
      const trackingUrl = `${baseUrl}/track/${existingToken.token}`
      return NextResponse.json({
        token: existingToken.token,
        trackingUrl,
        message: 'Tracking link already exists for this project',
      })
    }

    const token = generateSecureToken()

    const projectToken = await prisma.projectToken.create({
      data: {
        token,
        projectId: params.id,
        customerEmail: project.customerEmail,
        isActive: true,
      },
    })

    await logActivity(
      params.id,
      'token_generated',
      `Tracking link generated`
    )

    const trackingUrl = `${baseUrl}/track/${token}`

    return NextResponse.json(
      {
        token: projectToken.token,
        trackingUrl,
        createdAt: projectToken.createdAt.toISOString(),
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error generating token:', error)
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tokens = await prisma.projectToken.findMany({
      where: { projectId: params.id },
      orderBy: { createdAt: 'desc' },
    })

    const baseUrl = getBaseUrl(request)

    const serialized = tokens.map(token => ({
      ...token,
      trackingUrl: `${baseUrl}/track/${token.token}`,
      createdAt: token.createdAt.toISOString(),
    }))

    return NextResponse.json(serialized)
  } catch (error) {
    console.error('Error fetching tokens:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tokens' },
      { status: 500 }
    )
  }
}
