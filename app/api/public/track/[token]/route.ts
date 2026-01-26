import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const projectToken = await prisma.projectToken.findUnique({
      where: { token: params.token },
      include: {
        project: {
          include: {
            milestones: {
              orderBy: { order: 'asc' }
            },
            activityLogs: {
              orderBy: { createdAt: 'desc' },
              take: 10
            }
          }
        }
      }
    })

    if (!projectToken || !projectToken.isActive) {
      return NextResponse.json(
        { error: 'Invalid or inactive token' },
        { status: 404 }
      )
    }

    // Calculate progress
    const completedMilestones = projectToken.project.milestones.filter(
      m => m.status === 'COMPLETED'
    ).length
    const totalMilestones = projectToken.project.milestones.length
    const progressPercentage = totalMilestones > 0
      ? Math.round((completedMilestones / totalMilestones) * 100)
      : 0

    // Serialize dates for JSON response
    const project = {
      ...projectToken.project,
      progressPercentage,
      expectedCompletionDate: projectToken.project.expectedCompletionDate?.toISOString() || null,
      startDate: projectToken.project.startDate?.toISOString() || null,
      endDate: projectToken.project.endDate?.toISOString() || null,
      createdAt: projectToken.project.createdAt.toISOString(),
      updatedAt: projectToken.project.updatedAt.toISOString(),
    }

    const milestones = projectToken.project.milestones.map(m => ({
      ...m,
      targetDate: m.targetDate?.toISOString() || null,
      completedDate: m.completedDate?.toISOString() || null,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    }))

    const activityLogs = projectToken.project.activityLogs.map(a => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
    }))

    return NextResponse.json({
      project,
      milestones,
      activityLogs,
    })
  } catch (error) {
    console.error('Error fetching project data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
