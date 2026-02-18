import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { createMilestoneSchema } from '@/lib/validations/project'
import { logActivity } from '@/lib/utils/activity'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validated = createMilestoneSchema.parse(body)

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

    // Get max order for this project
    const maxOrder = await prisma.milestone.findFirst({
      where: { projectId: params.id },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    const order = validated.order ?? (maxOrder ? maxOrder.order + 1 : 0)

    // Create milestone
    const milestone = await prisma.milestone.create({
      data: {
        projectId: params.id,
        name: validated.name,
        description: validated.description,
        status: validated.status || 'PENDING',
        targetDate: validated.targetDate ? new Date(validated.targetDate) : null,
        order,
        prerequisiteMilestoneIds: validated.prerequisiteMilestoneIds?.length
          ? (JSON.stringify(validated.prerequisiteMilestoneIds) as unknown as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
    })

    // Log activity
    await logActivity(
      params.id,
      'milestone_created',
      `Milestone "${milestone.name}" was created`
    )

    // Serialize dates
    const serialized = {
      ...milestone,
      targetDate: milestone.targetDate?.toISOString() || null,
      completedDate: milestone.completedDate?.toISOString() || null,
      createdAt: milestone.createdAt.toISOString(),
      updatedAt: milestone.updatedAt.toISOString(),
    }

    return NextResponse.json(serialized, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating milestone:', error)
    return NextResponse.json(
      { error: 'Failed to create milestone' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const milestones = await prisma.milestone.findMany({
      where: { projectId: params.id },
      orderBy: { order: 'asc' },
    })

    // Serialize dates
    const serialized = milestones.map(m => ({
      ...m,
      targetDate: m.targetDate?.toISOString() || null,
      completedDate: m.completedDate?.toISOString() || null,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    }))

    return NextResponse.json(serialized)
  } catch (error) {
    console.error('Error fetching milestones:', error)
    return NextResponse.json(
      { error: 'Failed to fetch milestones' },
      { status: 500 }
    )
  }
}
