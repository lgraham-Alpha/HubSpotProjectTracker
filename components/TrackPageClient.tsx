'use client'

import { useEffect, useState, useCallback } from 'react'

interface SerializedMilestone {
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

const KEY_DATE_SOURCE_IDS = new Set([
  'targeted_go_live',
  'actual_go_live',
  'targeted_installation',
  'actual_installation',
  'targeted_training',
  'actual_training',
])

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

  const keyDates = project.milestones.filter(m => m.sourceId && KEY_DATE_SOURCE_IDS.has(m.sourceId) && (m.targetDate || m.completedDate))
  const checklistMilestones = project.milestones.filter(m => !m.sourceId || !KEY_DATE_SOURCE_IDS.has(m.sourceId))

  const completedMilestones = checklistMilestones.filter(m => m.status === 'COMPLETED').length
  const totalMilestones = checklistMilestones.length
  const progressPercentage = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0

  const statusLabel = progressPercentage === 100 ? 'Completed' : progressPercentage > 0 ? 'In Progress' : project.status === 'ON_HOLD' ? 'On Hold' : 'Not Started'
  const statusColor = progressPercentage === 100 ? 'bg-emerald-500' : progressPercentage > 0 ? 'bg-blue-500' : project.status === 'ON_HOLD' ? 'bg-amber-500' : 'bg-slate-400'

  const upcoming = checklistMilestones.filter(m => m.status !== 'COMPLETED')
  const completed = checklistMilestones.filter(m => m.status === 'COMPLETED')

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

          {/* Key Dates */}
          {keyDates.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Key Dates</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {keyDates.map(m => {
                  const date = m.targetDate || m.completedDate
                  const isPast = date ? new Date(date) < new Date() : false
                  return (
                    <div key={m.id} className="flex flex-col gap-0.5">
                      <span className="text-xs text-slate-400">{m.name}</span>
                      <span className={`text-base font-semibold ${isPast ? 'text-slate-900' : 'text-blue-600'}`}>
                        {formatDate(date)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Milestones */}
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">

        {/* Upcoming milestones */}
        {upcoming.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">In Progress &amp; Upcoming</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {upcoming.map((milestone) => (
                <div key={milestone.id} className={`rounded-xl border p-4 bg-white flex flex-col gap-2 ${
                  milestone.status === 'IN_PROGRESS' ? 'border-blue-200 shadow-sm shadow-blue-50' : 'border-slate-100'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-medium leading-snug ${milestone.status === 'IN_PROGRESS' ? 'text-slate-900' : 'text-slate-600'}`}>
                      {milestone.name}
                    </p>
                    {milestone.status === 'IN_PROGRESS' && (
                      <span className="shrink-0 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-0.5">
                        In Progress
                      </span>
                    )}
                  </div>
                  {milestone.description && (
                    <p className="text-sm text-slate-400">{milestone.description}</p>
                  )}
                  {milestone.targetDate && (
                    <p className="text-xs text-slate-400 mt-auto pt-1">
                      Scheduled: <span className="font-medium text-slate-500">{formatDate(milestone.targetDate)}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Completed milestones */}
        {completed.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Completed</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {completed.map((milestone) => (
                <div key={milestone.id} className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 flex flex-col gap-1">
                  <div className="flex items-start gap-2">
                    <div className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="font-medium text-slate-400 line-through decoration-slate-300 leading-snug">{milestone.name}</p>
                  </div>
                  {(milestone.completedDate || milestone.targetDate) && (
                    <p className="text-xs text-slate-300 pl-6">
                      {milestone.completedDate ? `Completed ${formatDate(milestone.completedDate)}` : formatDate(milestone.targetDate)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {totalMilestones === 0 && (
          <div className="text-center py-16 text-slate-400">
            <p className="text-lg font-medium">No milestones yet</p>
            <p className="text-sm mt-1">Check back soon for updates.</p>
          </div>
        )}

        <p className="text-center text-xs text-slate-300 pt-4">Updates automatically every 5 minutes</p>
      </div>
    </div>
  )
}
