import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { serializeProjectForTrack } from '@/lib/track/serialize'

export async function GET(
  _request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const projectToken = await prisma.projectToken.findUnique({
      where: { token: params.token },
      include: {
        project: {
          include: {
            milestones: {
              where: { showOnTrackPage: true },
              orderBy: { order: 'asc' },
            },
            activityLogs: { orderBy: { createdAt: 'desc' }, take: 10 },
          },
        },
      },
    })

    if (!projectToken?.isActive) {
      return NextResponse.json(
        { error: 'Invalid or inactive token' },
        { status: 404 }
      )
    }

    const serialized = serializeProjectForTrack(projectToken.project, {
      includeProgress: true,
    })
    return NextResponse.json(serialized)
  } catch (error) {
    console.error('Error fetching project data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
