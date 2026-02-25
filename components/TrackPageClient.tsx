'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import {
  computeScheduleRisk,
  getBlockingItems,
  getNextBlockingItems,
  type RiskLevel,
} from '@/lib/utils/milestone'
import type { Milestone } from '@prisma/client'

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

const BRAND = {
  name: 'Alpha',
  logoSrc: '/alpha-wolf.png',
  title: 'Customer Onboarding Tracker',
}

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const target = new Date(dateStr).getTime()
  const now = Date.now()
  return Math.floor((target - now) / (1000 * 60 * 60 * 24))
}

// Serialized milestones match Milestone shape for our utils (dates as strings are coerced)
function asMilestone(m: SerializedMilestone): Milestone {
  return {
    ...m,
    targetDate: m.targetDate ? new Date(m.targetDate) : null,
    completedDate: m.completedDate ? new Date(m.completedDate) : null,
    createdAt: new Date(m.createdAt),
    updatedAt: new Date(m.updatedAt),
  } as Milestone
}

function RiskChip({ risk }: { risk: RiskLevel }) {
  const style =
    risk === 'green'
      ? 'bg-emerald-500/15 text-emerald-200 ring-emerald-500/25'
      : risk === 'yellow'
        ? 'bg-amber-500/15 text-amber-200 ring-amber-500/25'
        : 'bg-red-500/15 text-red-200 ring-red-500/25'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${style}`}
    >
      Risk: {risk.charAt(0).toUpperCase() + risk.slice(1)}
    </span>
  )
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

  const keyDates = project.milestones.filter(
    (m) => m.sourceId && KEY_DATE_SOURCE_IDS.has(m.sourceId) && (m.targetDate || m.completedDate)
  )
  const checklistMilestones = project.milestones.filter(
    (m) => !m.sourceId || !KEY_DATE_SOURCE_IDS.has(m.sourceId)
  )
  const milestonesAsPrisma = checklistMilestones.map(asMilestone)

  const completedMilestones = checklistMilestones.filter((m) => m.status === 'COMPLETED').length
  const totalMilestones = checklistMilestones.length
  const progressPercentage =
    totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0

  const statusLabel =
    progressPercentage === 100
      ? 'Completed'
      : progressPercentage > 0
        ? 'In Progress'
        : project.status === 'ON_HOLD'
          ? 'On Hold'
          : 'Not Started'
  const statusBadgeClass =
    progressPercentage === 100
      ? 'bg-emerald-500/15 text-emerald-200 ring-emerald-500/25'
      : progressPercentage > 0
        ? 'bg-sky-500/15 text-sky-200 ring-sky-500/25'
        : project.status === 'ON_HOLD'
          ? 'bg-amber-500/15 text-amber-200 ring-amber-500/25'
          : 'bg-zinc-900 text-zinc-300 ring-zinc-800'

  const blockingItems = getNextBlockingItems(milestonesAsPrisma)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Top gradient */}
      <div className="h-32 bg-gradient-to-b from-orange-600/30 to-transparent pointer-events-none absolute top-0 left-0 right-0 z-0" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-10">
        {/* Header: logo + brand + project */}
        <header className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-xl overflow-hidden ring-1 ring-zinc-700 bg-zinc-900">
              <Image
                src={BRAND.logoSrc}
                alt=""
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-orange-400">
                {BRAND.name}
              </div>
              <div className="text-sm font-semibold text-zinc-200">{BRAND.title}</div>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white truncate">{project.name}</h1>
            {project.description && (
              <p className="mt-1 text-sm text-zinc-400 line-clamp-2">{project.description}</p>
            )}
          </div>
          <span
            className={`shrink-0 inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ring-1 ${statusBadgeClass}`}
          >
            {statusLabel}
          </span>
        </header>

        {/* Progress + Key Dates card */}
        <div className="rounded-3xl bg-zinc-900/40 p-6 ring-1 ring-zinc-800 backdrop-blur mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-zinc-400">Overall Progress</span>
              <span className="text-sm text-zinc-300">
                {completedMilestones} of {totalMilestones} completed
              </span>
            </div>
            <span className="text-lg font-bold text-white">{progressPercentage}%</span>
          </div>
          <div className="mt-3 w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                progressPercentage === 100 ? 'bg-emerald-500' : 'bg-orange-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          {project.expectedCompletionDate && (
            <p className="mt-2 text-sm text-zinc-400">
              Expected completion:{' '}
              <span className="font-medium text-zinc-200">
                {formatDate(project.expectedCompletionDate)}
              </span>
            </p>
          )}

          {keyDates.length > 0 && (
            <div className="mt-6 pt-6 border-t border-zinc-800">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">
                Key Dates
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {keyDates.map((m) => {
                  const date = m.targetDate || m.completedDate
                  const isPast = date ? new Date(date) < new Date() : false
                  return (
                    <div key={m.id} className="flex flex-col gap-0.5">
                      <span className="text-xs text-zinc-500">{m.name}</span>
                      <span
                        className={`text-sm font-semibold ${isPast ? 'text-zinc-300' : 'text-orange-400'}`}
                      >
                        {formatDate(date)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* What's blocking us */}
        {blockingItems.length > 0 && (
          <div className="rounded-3xl bg-zinc-900/40 p-6 ring-1 ring-zinc-800 backdrop-blur mb-8">
            <h2 className="text-base font-semibold text-zinc-200">What&apos;s blocking us</h2>
            <p className="mt-1 text-sm text-zinc-400">
              These items need to be done before we can move forward.
            </p>
            <ul className="mt-4 space-y-2">
              {blockingItems.map((label, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-sm text-zinc-300 rounded-xl bg-zinc-950/50 px-3 py-2 ring-1 ring-zinc-800"
                >
                  <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Timeline */}
        <div className="rounded-3xl bg-zinc-900/40 p-6 ring-1 ring-zinc-800 backdrop-blur">
          <h2 className="text-base font-semibold text-zinc-200 mb-6">Milestones</h2>

          {checklistMilestones.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <p className="font-medium">No milestones yet</p>
              <p className="text-sm mt-1">Check back soon for updates.</p>
            </div>
          ) : (
            <ul className="space-y-0">
              {checklistMilestones.map((milestone, idx) => {
                const isLast = idx === checklistMilestones.length - 1
                const isCompleted = milestone.status === 'COMPLETED'
                const isInProgress =
                  milestone.status === 'IN_PROGRESS' ||
                  (milestone.targetDate && !isCompleted)
                const risk: RiskLevel | null = isCompleted
                  ? null
                  : (computeScheduleRisk(asMilestone(milestone), milestonesAsPrisma) ?? null)
                const blockingForThis = getBlockingItems(asMilestone(milestone), milestonesAsPrisma)

                const dotClass = isCompleted
                  ? 'bg-emerald-500 ring-emerald-500/30'
                  : isInProgress
                    ? 'bg-sky-500 ring-sky-500/30'
                    : 'bg-zinc-600 ring-zinc-700'

                return (
                  <li
                    key={milestone.id}
                    className="relative rounded-2xl bg-zinc-950/50 p-4 ring-1 ring-zinc-800 mb-4 last:mb-0"
                  >
                    {!isLast && (
                      <div
                        className="pointer-events-none absolute left-[30px] top-[52px] h-[calc(100%+1rem)] w-px bg-zinc-800"
                        aria-hidden
                      />
                    )}

                    <div className="flex gap-4">
                      <div className="mt-0.5 flex flex-col items-center shrink-0">
                        <div
                          className={`h-3.5 w-3.5 rounded-full ring-4 ring-zinc-950 ${dotClass}`}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <p
                            className={`text-sm font-semibold ${
                              isCompleted ? 'text-zinc-400 line-through' : 'text-zinc-200'
                            }`}
                          >
                            {milestone.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            {milestone.status === 'IN_PROGRESS' && (
                              <span className="inline-flex items-center rounded-full bg-sky-500/15 px-2.5 py-1 text-[11px] font-semibold text-sky-200 ring-1 ring-sky-500/25">
                                In Progress
                              </span>
                            )}
                            {milestone.status === 'COMPLETED' && (
                              <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-200 ring-1 ring-emerald-500/25">
                                Completed
                              </span>
                            )}
                            {risk && <RiskChip risk={risk} />}
                          </div>
                        </div>

                        {milestone.targetDate && !isCompleted && (
                          <p className="mt-1.5 text-xs text-zinc-400">
                            Scheduled for{' '}
                            <span className="font-medium text-zinc-300">
                              {formatDateTime(milestone.targetDate)}
                            </span>
                            {daysUntil(milestone.targetDate) !== null && (
                              <span className="ml-2 text-zinc-500">
                                {daysUntil(milestone.targetDate)! >= 0
                                  ? `${daysUntil(milestone.targetDate)}d remaining`
                                  : `${Math.abs(daysUntil(milestone.targetDate)!)}d past due`}
                              </span>
                            )}
                          </p>
                        )}

                        {milestone.completedDate && isCompleted && (
                          <p className="mt-1.5 text-xs text-zinc-500">
                            Completed {formatDate(milestone.completedDate)}
                          </p>
                        )}

                        {milestone.description && (
                          <p className="mt-2 text-sm text-zinc-400">{milestone.description}</p>
                        )}

                        {blockingForThis.length > 0 && !isCompleted && (
                          <div className="mt-3 rounded-xl bg-zinc-900/60 p-3 ring-1 ring-zinc-800">
                            <div className="text-[11px] font-semibold text-zinc-400">
                              Prerequisites
                            </div>
                            <ul className="mt-2 space-y-1">
                              {blockingForThis.map((label, i) => (
                                <li
                                  key={i}
                                  className="flex items-center gap-2 text-[11px] text-zinc-500"
                                >
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                                  {label}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          <p className="text-center text-xs text-zinc-500 mt-6 pt-4">
            Updates automatically every 5 minutes
          </p>
        </div>
      </div>
    </div>
  )
}
