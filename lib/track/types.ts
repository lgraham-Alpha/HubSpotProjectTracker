/** Milestone as returned from the track API (dates as ISO strings). */
export interface SerializedMilestone {
  id: string
  projectId: string
  name: string
  description: string | null
  status: string
  sourceId: string | null
  targetDate: string | null
  completedDate: string | null
  order: number
  prerequisiteMilestoneIds: unknown
  createdAt: string
  updatedAt: string
}

/** Activity log as returned from the track API. */
export interface SerializedActivityLog {
  id: string
  projectId: string
  type: string
  message: string
  metadata: string | null
  createdAt: string
}

/** Project with serialized dates and nested milestones/activityLogs. */
export interface ProjectData {
  id: string
  name: string
  description: string | null
  status: string
  expectedCompletionDate: string | null
  milestones: SerializedMilestone[]
  activityLogs: SerializedActivityLog[]
}

/** Response shape from GET /api/public/track/[token]. */
export interface TrackApiResponse {
  project: Omit<ProjectData, 'milestones' | 'activityLogs'> & {
    progressPercentage?: number
  }
  milestones: SerializedMilestone[]
  activityLogs: SerializedActivityLog[]
}
