import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createProjectSchema } from '@/lib/validations/project'
import { logActivity } from '@/lib/utils/activity'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = createProjectSchema.parse(body)

    // Convert date strings to Date objects
    const project = await prisma.project.create({
      data: {
        name: validated.name,
        description: validated.description,
        customerEmail: validated.customerEmail,
        status: validated.status || 'NOT_STARTED',
        startDate: validated.startDate ? new Date(validated.startDate) : null,
        endDate: validated.endDate ? new Date(validated.endDate) : null,
        expectedCompletionDate: validated.expectedCompletionDate
          ? new Date(validated.expectedCompletionDate)
          : null,
        hubspotDealId: validated.hubspotDealId || null,
        hubspotContactId: validated.hubspotContactId || null,
      },
      include: {
        milestones: true,
        tokens: true,
      },
    })

    // Log activity
    await logActivity(project.id, 'project_created', `Project "${project.name}" was created`)

    return NextResponse.json(project, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const customerEmail = searchParams.get('customerEmail')

    const where: any = {}
    if (status) {
      where.status = status
    }
    if (customerEmail) {
      where.customerEmail = customerEmail
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        milestones: {
          orderBy: { order: 'asc' },
        },
        tokens: {
          where: { isActive: true },
        },
        _count: {
          select: {
            milestones: true,
            tasks: true,
            activityLogs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Serialize dates
    const serialized = projects.map(project => ({
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
    }))

    return NextResponse.json(serialized)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}
