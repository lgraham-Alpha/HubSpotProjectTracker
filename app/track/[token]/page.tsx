import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import TrackPageClient from '@/components/TrackPageClient'

interface PageProps {
  params: {
    token: string
  }
}

async function getProjectData(token: string) {
  const projectToken = await prisma.projectToken.findUnique({
    where: { token },
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
    return null
  }

  return projectToken.project
}

export default async function TrackPage({ params }: PageProps) {
  const project = await getProjectData(params.token)

  if (!project) {
    notFound()
  }

  // Serialize dates for client component
  const projectData = {
    ...project,
    expectedCompletionDate: project.expectedCompletionDate?.toISOString() || null,
    milestones: project.milestones.map(m => ({
      ...m,
      targetDate: m.targetDate?.toISOString() || null,
      completedDate: m.completedDate?.toISOString() || null,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    })),
    activityLogs: project.activityLogs.map(a => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
    })),
  }

  return <TrackPageClient initialData={projectData} token={params.token} />
}
