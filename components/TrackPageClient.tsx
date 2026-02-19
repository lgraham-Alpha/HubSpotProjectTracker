'use client'

import { useEffect, useState, useCallback } from 'react'
import { computeScheduleRisk, getBlockingItems, getNextBlockingItems, RiskLevel } from '@/lib/utils/milestone'

/** Serialized milestone (dates as ISO strings) as sent from server */
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

/** Serialized activity log as sent from server */
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

export default function TrackPageClient({ initialData, token }: TrackPageClientProps) {
  const [project, setProject] = useState<ProjectData>(initialData)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Helper to convert string dates to Date objects for milestone calculations
  const milestonesWithDates = project.milestones.map(m => ({
    ...m,
    targetDate: m.targetDate ? new Date(m.targetDate) : null,
    completedDate: m.completedDate ? new Date(m.completedDate) : null,
  }))

  const refreshData = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch(`/api/public/track/${token}`)
      if (response.ok) {
        const data = await response.json()
        setProject({
          ...data.project,
          milestones: data.milestones,
          activityLogs: data.activityLogs,
        })
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [token])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [refreshData])

  const completedMilestones = project.milestones.filter(m => m.status === 'COMPLETED').length
  const totalMilestones = project.milestones.length
  const progressPercentage = totalMilestones > 0
    ? Math.round((completedMilestones / totalMilestones) * 100)
    : 0

  const blockingItems = getNextBlockingItems(milestonesWithDates as any)

  const getRiskColor = (riskLevel: RiskLevel | null) => {
    if (!riskLevel) return ''
    switch (riskLevel) {
      case 'green':
        return 'bg-green-500'
      case 'yellow':
        return 'bg-yellow-500'
      case 'red':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getRiskBadge = (riskLevel: RiskLevel | null) => {
    if (!riskLevel) return null
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        riskLevel === 'green' ? 'bg-green-100 text-green-800' :
        riskLevel === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
        'bg-red-100 text-red-800'
      }`}>
        {riskLevel === 'green' ? '✓ On Track' :
         riskLevel === 'yellow' ? '⚠ Attention Needed' :
         '🚨 Urgent'}
      </span>
    )
  }

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    const days = Math.floor(hours / 24)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with refresh indicator — view only; no editing on this page */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              {isRefreshing ? 'Refreshing...' : '🔄 Refresh'}
            </button>
          </div>
          {project.description && (
            <p className="text-gray-600 mb-2">{project.description}</p>
          )}
          <p className="text-xs text-gray-500 mb-1">
            Last updated: {formatTimeAgo(lastUpdated)}
          </p>
          <p className="text-xs text-gray-400 italic">
            View only. Milestone status and completion are updated by your team via the admin portal and HubSpot.
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Project Status</h2>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              project.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
              project.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
              project.status === 'ON_HOLD' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {project.status.replace('_', ' ')}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Overall Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {project.expectedCompletionDate && (
            <p className="text-sm text-gray-600">
              Expected completion: {new Date(project.expectedCompletionDate).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Blocking Items Alert */}
        {blockingItems.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Waiting on:
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc list-inside space-y-1">
                    {blockingItems.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Milestones Timeline */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Milestones</h2>
          <div className="space-y-4">
            {project.milestones.map((milestone) => {
              const milestoneWithDates = {
                ...milestone,
                targetDate: milestone.targetDate ? new Date(milestone.targetDate) : null,
                completedDate: milestone.completedDate ? new Date(milestone.completedDate) : null,
              }
              const riskLevel = computeScheduleRisk(milestoneWithDates as any, milestonesWithDates as any)
              const blockingItemsForMilestone = getBlockingItems(milestoneWithDates as any, milestonesWithDates as any)
              const isBlocked = blockingItemsForMilestone.length > 0 && milestone.status !== 'COMPLETED'

              return (
                <div key={milestone.id} className="flex items-start">
                  <div className="flex-shrink-0 mr-4 relative">
                    {milestone.status === 'COMPLETED' ? (
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : milestone.status === 'IN_PROGRESS' ? (
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-white animate-pulse"></div>
                      </div>
                    ) : milestone.status === 'SCHEDULED' ? (
                      <div className="w-8 h-8 rounded-full border-2 border-blue-500 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      </div>
                    ) : isBlocked ? (
                      <div className="w-8 h-8 rounded-full border-2 border-red-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full border-2 border-gray-300"></div>
                    )}
                    {/* Risk indicator dot */}
                    {riskLevel && (
                      <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getRiskColor(riskLevel)} border-2 border-white`}></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{milestone.name}</h3>
                      <div className="flex items-center gap-2">
                        {getRiskBadge(riskLevel)}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          milestone.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          milestone.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                          milestone.status === 'SCHEDULED' ? 'bg-purple-100 text-purple-800' :
                          milestone.status === 'IN_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                          milestone.status === 'CHANGES_REQUESTED' ? 'bg-orange-100 text-orange-800' :
                          milestone.status === 'BLOCKED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {milestone.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    {milestone.description && (
                      <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                    )}
                    {isBlocked && (
                      <div className="mt-2 text-sm text-red-600">
                        <span className="font-medium">Blocked by:</span> {blockingItemsForMilestone.join(', ')}
                      </div>
                    )}
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      {milestone.targetDate && (
                        <span>Target: {new Date(milestone.targetDate).toLocaleDateString()}</span>
                      )}
                      {milestone.completedDate && (
                        <span className="ml-4">Completed: {new Date(milestone.completedDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Activity Feed */}
        {project.activityLogs.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {project.activityLogs.map((activity) => (
                <div key={activity.id} className="flex items-start text-sm">
                  <div className="flex-1">
                    <p className="text-gray-900">{activity.message}</p>
                    <p className="text-gray-500 mt-1">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
