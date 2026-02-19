import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateSecureToken } from '@/lib/utils/token'
import { createTokenSchema } from '@/lib/validations/project'
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
    const body = await request.json()
    const validated = createTokenSchema.parse(body)
    const baseUrl = getBaseUrl(request)

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: params.id },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Verify email matches project customer email
    if (project.customerEmail !== validated.customerEmail) {
      return NextResponse.json(
        { error: 'Email does not match project customer email' },
        { status: 400 }
      )
    }

    // Check if token already exists for this project and email
    const existingToken = await prisma.projectToken.findFirst({
      where: {
        projectId: params.id,
        customerEmail: validated.customerEmail,
        isActive: true,
      },
    })

    if (existingToken) {
      // Return existing token
      const trackingUrl = `${baseUrl}/track/${existingToken.token}`
      return NextResponse.json({
        token: existingToken.token,
        trackingUrl,
        message: 'Token already exists for this project and email',
      })
    }

    // Generate new token
    const token = generateSecureToken()

    const projectToken = await prisma.projectToken.create({
      data: {
        token,
        projectId: params.id,
        customerEmail: validated.customerEmail,
        isActive: true,
      },
    })

    // Log activity
    await logActivity(
      params.id,
      'token_generated',
      `Tracking link generated for ${validated.customerEmail}`
    )

    const trackingUrl = `${baseUrl}/track/${token}`

    return NextResponse.json(
      {
        token: projectToken.token,
        trackingUrl,
        customerEmail: projectToken.customerEmail,
        createdAt: projectToken.createdAt.toISOString(),
      },
      { status: 201 }
    )
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
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
