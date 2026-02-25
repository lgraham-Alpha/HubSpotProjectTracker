import type { TrackApiResponse } from './types'

type MilestoneWithDates = {
  id: string
  projectId: string
  name: string
  description: string | null
  status: string
  sourceId: string | null
  targetDate: Date | null
  completedDate: Date | null
  order: number
  prerequisiteMilestoneIds: unknown
  createdAt: Date
  updatedAt: Date
}

type ActivityLogWithDates = {
  id: string
  projectId: string
  type: string
  message: string
  metadata: string | null
  createdAt: Date
}

type ProjectWithRelations = {
  id: string
  name: string
  description: string | null
  status: string
  expectedCompletionDate: Date | null
  milestones: MilestoneWithDates[]
  activityLogs: ActivityLogWithDates[]
}

function toIso(d: Date | null): string | null {
  return d ? d.toISOString() : null
}

/** Serialize project + milestones + activityLogs for the track page / API. */
export function serializeProjectForTrack(
  project: ProjectWithRelations,
  options?: { includeProgress?: boolean }
): TrackApiResponse {
  const { includeProgress = false } = options ?? {}
  const milestones = project.milestones.map(m => ({
    ...m,
    targetDate: toIso(m.targetDate),
    completedDate: toIso(m.completedDate),
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  }))
  const activityLogs = project.activityLogs.map(a => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
  }))

  const completed = project.milestones.filter(m => m.status === 'COMPLETED').length
  const total = project.milestones.length
  const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0

  const projectPayload = {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    expectedCompletionDate: toIso(project.expectedCompletionDate),
    ...(includeProgress && { progressPercentage }),
  }

  return {
    project: projectPayload,
    milestones,
    activityLogs,
  }
}
