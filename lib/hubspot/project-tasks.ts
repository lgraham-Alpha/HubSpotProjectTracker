/**
 * HubSpot Projects (0-970) and their Tasks.
 * Used when a Project Tracking record has mapped_project = HubSpot Project ID;
 * we sync that project's tasks as milestones instead of the checklist properties.
 */

const HUBSPOT_API_BASE = 'https://api.hubapi.com'

const TASK_PROPERTIES = ['hs_task_subject', 'hs_timestamp', 'hs_task_status', 'hs_sort_order']

function getToken(): string {
  const token = process.env.HUBSPOT_DEVELOPER_API_KEY
  if (!token) throw new Error('HUBSPOT_DEVELOPER_API_KEY is required')
  return token
}

async function hubspotGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(path, HUBSPOT_API_BASE)
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data.message || data.errors?.[0]?.message || res.statusText
    throw new Error(`HubSpot API ${res.status}: ${msg}`)
  }
  return data as T
}

async function hubspotPost<T>(path: string, body: object): Promise<T> {
  const res = await fetch(new URL(path, HUBSPOT_API_BASE).toString(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data.message || data.errors?.[0]?.message || res.statusText
    throw new Error(`HubSpot API ${res.status}: ${msg}`)
  }
  return data as T
}

/**
 * Get task IDs associated with a HubSpot Project (object type projects).
 * Requires crm.objects.projects.read (and associations).
 */
export async function getTaskIdsForProject(hubspotProjectId: string): Promise<string[]> {
  const data = await hubspotGet<{ results?: Array<{ toObjectId?: string; id?: string }> }>(
    `/crm/v4/objects/projects/${hubspotProjectId}/associations/tasks`
  )
  const results = (data as { results?: Array<{ toObjectId?: string; id?: string }> }).results ?? []
  return results.map((r) => String(r.toObjectId ?? r.id ?? '')).filter(Boolean)
}

export interface HubSpotProjectTask {
  id: string
  subject: string
  dueDate: Date | null
  status: string
  order: number
}

/**
 * Batch read task details. HubSpot batch read accepts up to 100 IDs.
 */
export async function getProjectTasks(taskIds: string[]): Promise<HubSpotProjectTask[]> {
  if (taskIds.length === 0) return []
  const body = {
    inputs: taskIds.map((id) => ({ id })),
    properties: TASK_PROPERTIES,
  }
  const data = await hubspotPost<{
    results: Array<{
      id: string
      properties: Record<string, string>
    }>
  }>('/crm/v3/objects/tasks/batch/read', body)
  const results = (data as { results?: Array<{ id: string; properties: Record<string, string> }> }).results ?? []
  return results.map((r, index) => {
    const p = r.properties || {}
    const ts = p.hs_timestamp
    return {
      id: r.id,
      subject: (p.hs_task_subject ?? '').trim() || '(Unnamed task)',
      dueDate: ts ? new Date(ts) : null,
      status: (p.hs_task_status ?? 'NOT_STARTED').toUpperCase(),
      order: index,
    }
  })
}

/**
 * Fetch all tasks for a HubSpot Project, ordered by sort order then by batch order.
 */
export async function listTasksForHubSpotProject(hubspotProjectId: string): Promise<HubSpotProjectTask[]> {
  const taskIds = await getTaskIdsForProject(hubspotProjectId)
  if (taskIds.length === 0) return []
  const tasks = await getProjectTasks(taskIds)
  // Optionally sort by hs_sort_order if we add it to the response
  return tasks.sort((a, b) => a.order - b.order)
}
