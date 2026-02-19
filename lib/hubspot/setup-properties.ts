/**
 * Creates HubSpot custom properties via the CRM Properties API.
 * Creates the "Project Tracker" group first, then properties.
 * Requires scopes: crm.schemas.deals.write, crm.schemas.contacts.write
 */

const HUBSPOT_API_BASE = 'https://api.hubapi.com'
const GROUP_NAME = 'projecttracker'
const GROUP_LABEL = 'Project Tracker'

async function createGroup(accessToken: string, objectType: 'deals' | 'contacts') {
  const res = await fetch(`${HUBSPOT_API_BASE}/crm/v3/properties/${objectType}/groups`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ name: GROUP_NAME, label: GROUP_LABEL, displayOrder: -1 }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok && res.status !== 409) {
    const message = data.message || data.errors?.[0]?.message || res.statusText
    throw new Error(`${res.status}: ${message}`)
  }
  return data
}

async function createProperty(
  accessToken: string,
  objectType: 'deals' | 'contacts',
  body: { name: string; label: string; type: string; fieldType: string; groupName: string }
) {
  const res = await fetch(`${HUBSPOT_API_BASE}/crm/v3/properties/${objectType}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = data.message || data.errors?.[0]?.message || res.statusText
    throw new Error(`${res.status}: ${message}`)
  }
  return data
}

export async function createProjectTrackerProperties(accessToken: string) {
  const token = accessToken || process.env.HUBSPOT_DEVELOPER_API_KEY
  if (!token) {
    throw new Error('HubSpot access token or HUBSPOT_DEVELOPER_API_KEY required')
  }

  // Create property groups first (ignore 409 = already exists)
  try {
    await createGroup(token, 'deals')
  } catch (_) {}
  try {
    await createGroup(token, 'contacts')
  } catch (_) {}

  const results: { objectType: string; name: string; status: 'created' | 'exists' | 'error'; message?: string }[] = []

  // Deal: project_id
  try {
    await createProperty(token, 'deals', {
      name: 'project_id',
      label: 'Project ID',
      type: 'string',
      fieldType: 'text',
      groupName: GROUP_NAME,
    })
    results.push({ objectType: 'deals', name: 'project_id', status: 'created' })
  } catch (e: any) {
    const msg = e?.message || String(e)
    results.push({
      objectType: 'deals',
      name: 'project_id',
      status: msg.includes('already exists') || msg.includes('409') ? 'exists' : 'error',
      message: msg,
    })
  }

  // Deal: project_status
  try {
    await createProperty(token, 'deals', {
      name: 'project_status',
      label: 'Project Status',
      type: 'string',
      fieldType: 'text',
      groupName: GROUP_NAME,
    })
    results.push({ objectType: 'deals', name: 'project_status', status: 'created' })
  } catch (e: any) {
    const msg = e?.message || String(e)
    results.push({
      objectType: 'deals',
      name: 'project_status',
      status: msg.includes('already exists') || msg.includes('409') ? 'exists' : 'error',
      message: msg,
    })
  }

  // Contact: project_tracking_link
  try {
    await createProperty(token, 'contacts', {
      name: 'project_tracking_link',
      label: 'Project Tracking Link',
      type: 'string',
      fieldType: 'text',
      groupName: GROUP_NAME,
    })
    results.push({ objectType: 'contacts', name: 'project_tracking_link', status: 'created' })
  } catch (e: any) {
    const msg = e?.message || String(e)
    results.push({
      objectType: 'contacts',
      name: 'project_tracking_link',
      status: msg.includes('already exists') || msg.includes('409') ? 'exists' : 'error',
      message: msg,
    })
  }

  return results
}
