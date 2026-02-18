'use client'

import { useState, useEffect } from 'react'

interface Project {
  id: string
  name: string
  description?: string
  customerEmail: string
  status: string
  createdAt: string
  _count?: {
    milestones: number
    tasks: number
  }
}

export default function AdminPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    customerEmail: '',
  })

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      if (!res.ok) {
        setProjects([])
        return
      }
      setProjects(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching projects:', error)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/6aca2622-a87d-49d8-98d0-5e9ec39c4f46',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin/page.tsx:handleCreateProject',message:'create project request start',data:{hasName:!!formData.name,hasEmail:!!formData.customerEmail},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
      // #endregion
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/6aca2622-a87d-49d8-98d0-5e9ec39c4f46',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin/page.tsx:handleCreateProject',message:'create project response',data:{status:res.status,ok:res.ok,contentType:res.headers.get('content-type')},timestamp:Date.now(),hypothesisId:'H5'})}).catch(()=>{});
      // #endregion

      if (!res.ok) {
        let error: { error?: string } = {}
        try { error = await res.json() } catch (_) { error = { error: 'Response not JSON' } }
        alert(`Error: ${error.error}`)
        return
      }

      const project = await res.json()
      alert(`Project "${project.name}" created successfully!`)
      setFormData({ name: '', description: '', customerEmail: '' })
      setShowCreateForm(false)
      fetchProjects()
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/6aca2622-a87d-49d8-98d0-5e9ec39c4f46',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin/page.tsx:handleCreateProject',message:'create project catch',data:{errName:error?.name,errMessage:error?.message},timestamp:Date.now(),hypothesisId:'H5'})}).catch(()=>{});
      // #endregion
      console.error('Error creating project:', error)
      alert('Failed to create project')
    }
  }

  const handleGenerateToken = async (projectId: string, customerEmail: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerEmail }),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(`Error: ${error.error}`)
        return
      }

      const data = await res.json()
      navigator.clipboard.writeText(data.trackingUrl)
      alert(`Tracking link copied to clipboard!\n\n${data.trackingUrl}`)
    } catch (error) {
      console.error('Error generating token:', error)
      alert('Failed to generate tracking link')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Project Tracker Admin</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {showCreateForm ? 'Cancel' : '+ Create Project'}
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="e.g., Website Redesign"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Customer Email *</label>
                <input
                  type="email"
                  required
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="customer@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Project description..."
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Project
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Projects</h2>
          </div>
          {projects.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No projects yet. Create your first project above.
            </div>
          ) : (
            <div className="divide-y">
              {projects.map((project) => (
                <div key={project.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{project.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{project.customerEmail}</p>
                      {project.description && (
                        <p className="text-sm text-gray-500 mt-2">{project.description}</p>
                      )}
                      <div className="flex gap-4 mt-3 text-sm text-gray-500">
                        <span>Status: <span className="font-medium">{project.status}</span></span>
                        {project._count && (
                          <>
                            <span>Milestones: {project._count.milestones}</span>
                            <span>Tasks: {project._count.tasks}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`/admin/projects/${project.id}`}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm"
                      >
                        View Details
                      </a>
                      <button
                        onClick={() => handleGenerateToken(project.id, project.customerEmail)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                      >
                        Get Tracking Link
                      </button>
                    </div>
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
