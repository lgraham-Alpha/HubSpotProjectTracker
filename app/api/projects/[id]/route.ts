import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        milestones: {
          orderBy: { order: 'asc' },
        },
        tasks: {
          orderBy: { createdAt: 'desc' },
        },
        tokens: {
          where: { isActive: true },
        },
        activityLogs: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Serialize dates
    const serialized = {
      ...project,
      startDate: project.startDate?.toISOString() || null,
      endDate: project.endDate?.toISOString() || null,
      expectedCompletionDate: project.expectedCompletionDate?.toISOString() || null,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      milestones: project.milestones.map(m => ({
        ...m,
        targetDate: m.targetDate?.toISOString() || null,
        completedDate: m.completedDate?.toISOString() || null,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
      })),
      tasks: project.tasks.map(t => ({
        ...t,
        dueDate: t.dueDate?.toISOString() || null,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
      activityLogs: project.activityLogs.map(a => ({
        ...a,
        createdAt: a.createdAt.toISOString(),
      })),
    }

    return NextResponse.json(serialized)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { createProjectSchema } = await import('@/lib/validations/project')
    
    // Allow partial updates
    const validated = createProjectSchema.partial().parse(body)

    const updateData: any = {}
    if (validated.name) updateData.name = validated.name
    if (validated.description !== undefined) updateData.description = validated.description
    if (validated.customerEmail) updateData.customerEmail = validated.customerEmail
    if (validated.status) updateData.status = validated.status
    if (validated.startDate !== undefined) {
      updateData.startDate = validated.startDate ? new Date(validated.startDate) : null
    }
    if (validated.endDate !== undefined) {
      updateData.endDate = validated.endDate ? new Date(validated.endDate) : null
    }
    if (validated.expectedCompletionDate !== undefined) {
      updateData.expectedCompletionDate = validated.expectedCompletionDate
        ? new Date(validated.expectedCompletionDate)
        : null
    }
    if (validated.hubspotDealId !== undefined) {
      updateData.hubspotDealId = validated.hubspotDealId
    }
    if (validated.hubspotContactId !== undefined) {
      updateData.hubspotContactId = validated.hubspotContactId
    }

    const project = await prisma.project.update({
      where: { id: params.id },
      data: updateData,
      include: {
        milestones: true,
        tokens: true,
      },
    })

    // Log activity
    const { logActivity } = await import('@/lib/utils/activity')
    await logActivity(project.id, 'project_updated', `Project "${project.name}" was updated`)

    // Serialize dates
    const serialized = {
      ...project,
      startDate: project.startDate?.toISOString() || null,
      endDate: project.endDate?.toISOString() || null,
      expectedCompletionDate: project.expectedCompletionDate?.toISOString() || null,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    }

    return NextResponse.json(serialized)
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}
