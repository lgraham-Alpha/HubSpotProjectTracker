import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateSecureToken } from '@/lib/utils/token'
import { createTokenSchema } from '@/lib/validations/project'
import { logActivity } from '@/lib/utils/activity'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validated = createTokenSchema.parse(body)

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
      const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track/${existingToken.token}`
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

    const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track/${token}`

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

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

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
