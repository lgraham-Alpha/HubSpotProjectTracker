'use client'

import { useEffect, useState, useCallback } from 'react'

interface SerializedMilestone {
  id: string
  projectId: string
  name: string
  description: string | null
  status: string
  targetDate: string | null
  completedDate: string | null
  order: number
  prerequisiteMilestoneIds: unknown
  createdAt: string
  updatedAt: string
}

interface SerializedActivityLog {
  id: string
  projectId: string
  type: string
  message: string
  metadata: string | null
  createdAt: string
}

interface ProjectData {
  id: string
  name: string
  description: string | null
  status: string
  expectedCompletionDate: string | null
  milestones: SerializedMilestone[]
  activityLogs: SerializedActivityLog[]
}

interface TrackPageClientProps {
  initialData: ProjectData
  token: string
}

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function TrackPageClient({ initialData, token }: TrackPageClientProps) {
  const [project, setProject] = useState<ProjectData>(initialData)

  const refreshData = useCallback(async () => {
    try {
      const response = await fetch(`/api/public/track/${token}`)
      if (response.ok) {
        const data = await response.json()
        setProject({ ...data.project, milestones: data.milestones, activityLogs: data.activityLogs })
      }
    } catch {}
  }, [token])

  useEffect(() => {
    const interval = setInterval(refreshData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [refreshData])

  const completedMilestones = project.milestones.filter(m => m.status === 'COMPLETED').length
  const totalMilestones = project.milestones.length
  const progressPercentage = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0

  const statusLabel = progressPercentage === 100 ? 'Completed' : progressPercentage > 0 ? 'In Progress' : project.status === 'ON_HOLD' ? 'On Hold' : 'Not Started'
  const statusColor = progressPercentage === 100 ? 'bg-emerald-500' : progressPercentage > 0 ? 'bg-blue-500' : project.status === 'ON_HOLD' ? 'bg-amber-500' : 'bg-slate-400'

  const upcoming = project.milestones.filter(m => m.status !== 'COMPLETED')
  const completed = project.milestones.filter(m => m.status === 'COMPLETED')

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{project.name}</h1>
              {project.description && (
                <p className="mt-2 text-slate-500 text-base">{project.description}</p>
              )}
            </div>
            <span className={`shrink-0 mt-1 inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-medium ${statusColor}`}>
              {statusLabel}
            </span>
          </div>

          {/* Progress */}
          <div className="mt-8">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-sm font-medium text-slate-600">Overall Progress</span>
              <span className="text-sm text-slate-500">{completedMilestones} of {totalMilestones} completed</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${progressPercentage === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="mt-1.5 text-right text-xs text-slate-400">{progressPercentage}%</div>
          </div>

          {project.expectedCompletionDate && (
            <p className="mt-2 text-sm text-slate-500">
              Expected completion: <span className="font-medium text-slate-700">{formatDate(project.expectedCompletionDate)}</span>
            </p>
          )}
        </div>
      </div>

      {/* Milestones */}
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">

        {/* Upcoming milestones */}
        {upcoming.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-6">Upcoming</h2>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-3.5 top-0 bottom-0 w-px bg-slate-200" />
              <div className="space-y-0">
                {upcoming.map((milestone, i) => {
                  const isFirst = i === 0
                  return (
                    <div key={milestone.id} className="relative flex items-start gap-5 pb-8 last:pb-0">
                      {/* Dot */}
                      <div className={`relative z-10 shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center mt-0.5 bg-white ${
                        milestone.status === 'IN_PROGRESS' ? 'border-blue-500' :
                        milestone.status === 'SCHEDULED' ? 'border-blue-400' :
                        isFirst ? 'border-slate-400' :
                        'border-slate-200'
                      }`}>
                        {milestone.status === 'IN_PROGRESS' && (
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                        )}
                        {milestone.status === 'SCHEDULED' && (
                          <div className="w-2 h-2 rounded-full bg-blue-400" />
                        )}
                        {milestone.status !== 'IN_PROGRESS' && milestone.status !== 'SCHEDULED' && (
                          <div className={`w-2 h-2 rounded-full ${isFirst ? 'bg-slate-400' : 'bg-slate-200'}`} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <p className={`font-medium ${isFirst ? 'text-slate-900' : 'text-slate-600'}`}>
                            {milestone.name}
                          </p>
                          {milestone.status === 'IN_PROGRESS' && (
                            <span className="shrink-0 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">In Progress</span>
                          )}
                        </div>
                        {milestone.description && (
                          <p className="mt-0.5 text-sm text-slate-400">{milestone.description}</p>
                        )}
                        <div className="mt-1 flex gap-4 text-xs text-slate-400">
                          {milestone.targetDate && (
                            <span>Scheduled: {formatDate(milestone.targetDate)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* Completed milestones */}
        {completed.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-6">Completed</h2>
            <div className="relative">
              <div className="absolute left-3.5 top-0 bottom-0 w-px bg-emerald-100" />
              <div className="space-y-0">
                {completed.map((milestone) => (
                  <div key={milestone.id} className="relative flex items-start gap-5 pb-7 last:pb-0">
                    {/* Check dot */}
                    <div className="relative z-10 shrink-0 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center mt-0.5">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="font-medium text-slate-400 line-through decoration-slate-300">{milestone.name}</p>
                      <div className="mt-0.5 flex gap-4 text-xs text-slate-300">
                        {milestone.completedDate && (
                          <span>Completed {formatDate(milestone.completedDate)}</span>
                        )}
                        {!milestone.completedDate && milestone.targetDate && (
                          <span>{formatDate(milestone.targetDate)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {totalMilestones === 0 && (
          <div className="text-center py-16 text-slate-400">
            <p className="text-lg font-medium">No milestones yet</p>
            <p className="text-sm mt-1">Check back soon for updates.</p>
          </div>
        )}

        <p className="text-center text-xs text-slate-300 pt-4">
          Updates automatically every 5 minutes
        </p>
      </div>
    </div>
  )
}
