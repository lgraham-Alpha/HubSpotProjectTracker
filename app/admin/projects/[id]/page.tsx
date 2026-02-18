'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Milestone {
  id: string
  name: string
  description?: string
  status: string
  targetDate?: string
  completedDate?: string
  order: number
}

interface Project {
  id: string
  name: string
  description?: string
  customerEmail: string
  status: string
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

  useEffect(() => {
    fetchProject()
  }, [projectId])

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`)
      if (!res.ok) {
        alert('Project not found')
        router.push('/admin')
        return
      }
      const data = await res.json()
      setProject(data)
    } catch (error) {
      console.error('Error fetching project:', error)
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

  const handleGenerateToken = async () => {
    if (!project) return
    try {
      const res = await fetch(`/api/projects/${projectId}/tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerEmail: project.customerEmail }),
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
              <p className="text-gray-600 mt-1">{project.customerEmail}</p>
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
              {project.milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{milestone.name}</h3>
                      {milestone.description && (
                        <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                      )}
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span>Status: <span className="font-medium">{milestone.status}</span></span>
                        {milestone.targetDate && (
                          <span>Target: {new Date(milestone.targetDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <select
                      value={milestone.status}
                      onChange={(e) => handleUpdateMilestoneStatus(milestone.id, e.target.value)}
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
