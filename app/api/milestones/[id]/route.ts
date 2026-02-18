import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { updateMilestoneSchema } from '@/lib/validations/project'
import { logActivity } from '@/lib/utils/activity'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const milestone = await prisma.milestone.findUnique({
      where: { id: params.id },
      include: {
        project: true,
      },
    })

    if (!milestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      )
    }

    // Serialize dates
    const serialized = {
      ...milestone,
      targetDate: milestone.targetDate?.toISOString() || null,
      completedDate: milestone.completedDate?.toISOString() || null,
      createdAt: milestone.createdAt.toISOString(),
      updatedAt: milestone.updatedAt.toISOString(),
    }

    return NextResponse.json(serialized)
  } catch (error) {
    console.error('Error fetching milestone:', error)
    return NextResponse.json(
      { error: 'Failed to fetch milestone' },
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
    const validated = updateMilestoneSchema.parse(body)

    // Get current milestone to check status changes
    const currentMilestone = await prisma.milestone.findUnique({
      where: { id: params.id },
      include: { project: true },
    })

    if (!currentMilestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (validated.name) updateData.name = validated.name
    if (validated.description !== undefined) updateData.description = validated.description
    if (validated.status) updateData.status = validated.status
    if (validated.targetDate !== undefined) {
      updateData.targetDate = validated.targetDate ? new Date(validated.targetDate) : null
    }
    if (validated.completedDate !== undefined) {
      updateData.completedDate = validated.completedDate
        ? new Date(validated.completedDate)
        : null
    }
    if (validated.order !== undefined) updateData.order = validated.order
    if (validated.prerequisiteMilestoneIds !== undefined) {
      updateData.prerequisiteMilestoneIds = validated.prerequisiteMilestoneIds.length > 0
        ? (JSON.stringify(validated.prerequisiteMilestoneIds) as unknown as Prisma.InputJsonValue)
        : Prisma.JsonNull
    }

    // Auto-set completedDate if status is COMPLETED and completedDate is not set
    if (validated.status === 'COMPLETED' && !updateData.completedDate && !currentMilestone.completedDate) {
      updateData.completedDate = new Date()
    }

    // Auto-clear completedDate if status is not COMPLETED
    if (validated.status && validated.status !== 'COMPLETED' && currentMilestone.completedDate) {
      updateData.completedDate = null
    }

    const milestone = await prisma.milestone.update({
      where: { id: params.id },
      data: updateData,
    })

    // Log activity
    const activityMessages: string[] = []
    if (validated.status && validated.status !== currentMilestone.status) {
      activityMessages.push(`status changed to ${validated.status}`)
    }
    if (validated.name && validated.name !== currentMilestone.name) {
      activityMessages.push(`renamed to "${validated.name}"`)
    }
    if (activityMessages.length > 0) {
      await logActivity(
        currentMilestone.projectId,
        'milestone_updated',
        `Milestone "${milestone.name}" ${activityMessages.join(', ')}`
      )
    }

    // Serialize dates
    const serialized = {
      ...milestone,
      targetDate: milestone.targetDate?.toISOString() || null,
      completedDate: milestone.completedDate?.toISOString() || null,
      createdAt: milestone.createdAt.toISOString(),
      updatedAt: milestone.updatedAt.toISOString(),
    }

    return NextResponse.json(serialized)
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      )
    }
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error updating milestone:', error)
    return NextResponse.json(
      { error: 'Failed to update milestone' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const milestone = await prisma.milestone.findUnique({
      where: { id: params.id },
      include: { project: true },
    })

    if (!milestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      )
    }

    await prisma.milestone.delete({
      where: { id: params.id },
    })

    // Log activity
    await logActivity(
      milestone.projectId,
      'milestone_deleted',
      `Milestone "${milestone.name}" was deleted`
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      )
    }
    console.error('Error deleting milestone:', error)
    return NextResponse.json(
      { error: 'Failed to delete milestone' },
      { status: 500 }
    )
  }
}
