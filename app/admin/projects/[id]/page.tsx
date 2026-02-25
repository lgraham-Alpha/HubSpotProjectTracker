'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { KEY_DATE_OPTIONS } from '@/lib/track/constants'

function parsePrerequisiteIds(raw: unknown): string[] {
  if (!raw) return []
  const arr = Array.isArray(raw) ? raw : []
  return arr.filter((x): x is string => typeof x === 'string')
}

interface Milestone {
  id: string
  name: string
  description?: string
  status: string
  targetDate?: string
  completedDate?: string
  order: number
  sourceId?: string | null
  prerequisiteMilestoneIds?: unknown
  showOnTrackPage?: boolean
}

interface Project {
  id: string
  name: string
  description?: string
  customerEmail: string
  status: string
  keyDateSourceIds?: string[] | null
  milestones: Milestone[]
  tokens: Array<{
    id: string
    token: string
    customerEmail: string
    isActive: boolean
    createdAt: string
  }>
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [showMilestoneForm, setShowMilestoneForm] = useState(false)
  const [milestoneForm, setMilestoneForm] = useState({
    name: '',
    description: '',
    targetDate: '',
  })
  const [selectedKeyDateIds, setSelectedKeyDateIds] = useState<string[]>([])

  useEffect(() => {
    fetchProject()
  }, [projectId])

  useEffect(() => {
    if (project) {
      setSelectedKeyDateIds(
        project.keyDateSourceIds && project.keyDateSourceIds.length > 0
          ? project.keyDateSourceIds
          : KEY_DATE_OPTIONS.map((o) => o.id)
      )
    }
  }, [project?.id, project?.keyDateSourceIds])

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`)
      if (!res.ok) {
        alert('Project not found')
        router.push('/admin')
        return
      }
      const data = await res.json()
      setProject({
        ...data,
        keyDateSourceIds: Array.isArray(data.keyDateSourceIds) ? data.keyDateSourceIds : undefined,
        milestones: Array.isArray(data.milestones) ? data.milestones : [],
        tokens: Array.isArray(data.tokens) ? data.tokens : [],
      })
    } catch (error) {
      console.error('Error fetching project:', error)
      setProject(null)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/projects/${projectId}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: milestoneForm.name,
          description: milestoneForm.description || undefined,
          targetDate: milestoneForm.targetDate || undefined,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(`Error: ${error.error}`)
        return
      }

      alert('Milestone created successfully!')
      setMilestoneForm({ name: '', description: '', targetDate: '' })
      setShowMilestoneForm(false)
      fetchProject()
    } catch (error) {
      console.error('Error creating milestone:', error)
      alert('Failed to create milestone')
    }
  }

  const handleUpdateMilestoneStatus = async (milestoneId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/milestones/${milestoneId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(`Error: ${error.error}`)
        return
      }

      fetchProject()
    } catch (error) {
      console.error('Error updating milestone:', error)
      alert('Failed to update milestone')
    }
  }

  const handleSaveKeyDates = async (selectedIds: string[]) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyDateSourceIds: selectedIds.length > 0 ? selectedIds : null,
        }),
      })
      if (!res.ok) {
        const error = await res.json()
        alert(`Error: ${error.error}`)
        return
      }
      fetchProject()
    } catch (error) {
      console.error('Error saving key dates:', error)
      alert('Failed to save key dates')
    }
  }

  const handleUpdatePrerequisites = async (milestoneId: string, prerequisiteIds: string[]) => {
    try {
      const res = await fetch(`/api/milestones/${milestoneId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prerequisiteMilestoneIds: prerequisiteIds }),
      })
      if (!res.ok) {
        const error = await res.json()
        alert(`Error: ${error.error}`)
        return
      }
      fetchProject()
    } catch (error) {
      console.error('Error updating prerequisites:', error)
      alert('Failed to update prerequisites')
    }
  }

  const handleToggleShowOnTrackPage = async (milestoneId: string, show: boolean) => {
    try {
      const res = await fetch(`/api/milestones/${milestoneId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showOnTrackPage: show }),
      })
      if (!res.ok) {
        const error = await res.json()
        alert(`Error: ${error.error}`)
        return
      }
      fetchProject()
    } catch (error) {
      console.error('Error updating visibility:', error)
      alert('Failed to update visibility')
    }
  }

  const handleMoveMilestone = async (milestoneId: string, direction: 'up' | 'down') => {
    if (!project) return
    const sorted = [...project.milestones].sort((a, b) => a.order - b.order)
    const idx = sorted.findIndex((m) => m.id === milestoneId)
    if (idx < 0) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return
    const a = sorted[idx]
    const b = sorted[swapIdx]
    try {
      await Promise.all([
        fetch(`/api/milestones/${a.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: b.order }),
        }),
        fetch(`/api/milestones/${b.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: a.order }),
        }),
      ])
      fetchProject()
    } catch (error) {
      console.error('Error reordering:', error)
      alert('Failed to reorder')
    }
  }

  const handleGenerateToken = async () => {
    if (!project) return
    try {
      const res = await fetch(`/api/projects/${projectId}/tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(`Error: ${error.error}`)
        return
      }

      const data = await res.json()
      navigator.clipboard.writeText(data.trackingUrl)
      alert(`Tracking link copied to clipboard!\n\n${data.trackingUrl}`)
      fetchProject()
    } catch (error) {
      console.error('Error generating token:', error)
      alert('Failed to generate tracking link')
    }
  }

  const handleDeleteProject = async () => {
    if (!project) return
    if (!confirm(`Delete "${project.name}"? This removes all milestones, tasks, and tracking links.`)) return
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Failed to delete')
        return
      }
      router.push('/admin')
    } catch {
      alert('Failed to delete project')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return null
  }

  const activeToken = project.tokens.find(t => t.isActive)
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
  const trackingUrl = activeToken
    ? `${baseUrl}/track/${activeToken.token}`
    : null

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push('/admin')}
          className="text-blue-600 hover:underline mb-4"
        >
          ← Back to Projects
        </button>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold">{project.name}</h1>
              {project.description && (
                <p className="text-gray-500 mt-2">{project.description}</p>
              )}
            </div>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {project.status}
            </span>
          </div>

          {trackingUrl ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-green-800 mb-2">Tracking Link:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={trackingUrl}
                  readOnly
                  className="flex-1 border rounded px-3 py-2 bg-white text-sm"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(trackingUrl)
                    alert('Link copied!')
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                >
                  Copy
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleGenerateToken}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 mb-4"
            >
              Generate Tracking Link
            </button>
          )}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleDeleteProject}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Delete project
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Track page config</h2>
          <p className="text-sm text-gray-500 mb-4">
            Choose which items appear as &quot;key dates&quot; on the customer track page (vs checklist milestones). Leave all checked for default.
          </p>
          <div className="flex flex-wrap gap-4 mb-4">
            {KEY_DATE_OPTIONS.map((opt) => (
              <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedKeyDateIds.includes(opt.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedKeyDateIds((prev) => [...prev, opt.id])
                    } else {
                      setSelectedKeyDateIds((prev) => prev.filter((id) => id !== opt.id))
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={() => handleSaveKeyDates(selectedKeyDateIds)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
          >
            Save key dates
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Milestones</h2>
            <button
              onClick={() => setShowMilestoneForm(!showMilestoneForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
            >
              {showMilestoneForm ? 'Cancel' : '+ Add Milestone'}
            </button>
          </div>

          {showMilestoneForm && (
            <form onSubmit={handleCreateMilestone} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Milestone Name *</label>
                <input
                  type="text"
                  required
                  value={milestoneForm.name}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="e.g., Design Phase Complete"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={milestoneForm.description}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target Date</label>
                <input
                  type="date"
                  value={milestoneForm.targetDate}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, targetDate: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Milestone
              </button>
            </form>
          )}

          {project.milestones.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No milestones yet.</p>
          ) : (
            <div className="space-y-3">
              {[...project.milestones]
                .sort((a, b) => a.order - b.order)
                .map((milestone, index) => {
                  const otherMilestones = project.milestones.filter((m) => m.id !== milestone.id)
                  const prereqIds = parsePrerequisiteIds(milestone.prerequisiteMilestoneIds)
                  const showOnTrack = milestone.showOnTrackPage !== false
                  return (
                    <div
                      key={milestone.id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{milestone.name}</h3>
                            <span className="text-xs text-gray-400">Order: {milestone.order}</span>
                          </div>
                          {milestone.description && (
                            <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                          )}
                          <div className="flex gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                            <span>Status: <span className="font-medium">{milestone.status}</span></span>
                            {milestone.targetDate && (
                              <span>Target: {new Date(milestone.targetDate).toLocaleDateString()}</span>
                            )}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-4 items-center">
                            <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                              <input
                                type="checkbox"
                                checked={showOnTrack}
                                onChange={() =>
                                  handleToggleShowOnTrackPage(milestone.id, !showOnTrack)
                                }
                                className="rounded border-gray-300"
                              />
                              Show on track page
                            </label>
                            {otherMilestones.length > 0 && (
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                <span className="text-sm font-medium text-gray-700">
                                  Prerequisites (must complete first):
                                </span>
                                {otherMilestones.map((m) => (
                                  <label
                                    key={m.id}
                                    className="flex items-center gap-1.5 cursor-pointer text-sm"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={prereqIds.includes(m.id)}
                                      onChange={(e) => {
                                        const next = e.target.checked
                                          ? [...prereqIds, m.id]
                                          : prereqIds.filter((id) => id !== m.id)
                                        handleUpdatePrerequisites(milestone.id, next)
                                      }}
                                      className="rounded border-gray-300"
                                    />
                                    {m.name}
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMoveMilestone(milestone.id, 'up')}
                            disabled={index === 0}
                            className="border rounded px-2 py-1 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
                            title="Move up"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveMilestone(milestone.id, 'down')}
                            disabled={index === project.milestones.length - 1}
                            className="border rounded px-2 py-1 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
                            title="Move down"
                          >
                            ↓
                          </button>
                          <select
                            value={milestone.status}
                            onChange={(e) =>
                              handleUpdateMilestoneStatus(milestone.id, e.target.value)
                            }
                            className="border rounded px-3 py-1 text-sm"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="SCHEDULED">Scheduled</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="IN_REVIEW">In Review</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="BLOCKED">Blocked</option>
                            <option value="CHANGES_REQUESTED">Changes Requested</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
