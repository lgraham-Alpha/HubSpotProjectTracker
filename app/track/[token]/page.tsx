import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { serializeProjectForTrack } from '@/lib/track/serialize'
import type { ProjectData } from '@/lib/track/types'
import TrackPageClient from '@/components/TrackPageClient'

interface PageProps {
  params: { token: string }
}

async function getProjectByToken(token: string) {
  const projectToken = await prisma.projectToken.findUnique({
    where: { token },
    include: {
      project: {
        include: {
          milestones: { orderBy: { order: 'asc' } },
          activityLogs: { orderBy: { createdAt: 'desc' }, take: 10 },
        },
      },
    },
  })
  if (!projectToken?.isActive) return null
  return projectToken.project
}

export default async function TrackPage({ params }: PageProps) {
  const project = await getProjectByToken(params.token)
  if (!project) notFound()

  const serialized = serializeProjectForTrack(project)
  const initialData: ProjectData = {
    ...serialized.project,
    milestones: serialized.milestones,
    activityLogs: serialized.activityLogs,
  }

  return <TrackPageClient initialData={initialData} token={params.token} />
}
