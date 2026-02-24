/**
 * HubSpot Project tracking custom object (2-57870997).
 * Projects are single records; "tasks" are properties on that record.
 */

const HUBSPOT_API_BASE = 'https://api.hubapi.com'
const PROJECT_TRACKING_OBJECT_TYPE = '2-57870997'

/** Property names to request: project info + task-like checklist fields */
const PROJECT_AND_TASK_PROPERTIES = [
  'project_name',
  'client_name',
  'hs_object_id',
  'hs_pipeline',
  'hs_pipeline_stage',
  'hs_createdate',
  'hs_lastmodifieddate',
  'mapped_company',
  'mapped_contact',
  'mapped_project',
  'poc___email',
  'project_description',
  // Administrative tasks
  'equipment_ordered',
  'equipment_received',
  'onboarding_and_one_time_fees_charged',
  'processing_application_submitted',
  'subscription_created',
  // Database information
  'customers_and_loyalty_imported',
  'floor_plans_',
  'food_menu',
  'gift_cards',
  'gift_cards_imported',
  'jobs_and_job_permissions',
  'liquor_menu',
  'loyalty',
  'modifiers',
  'n3rd_party_integrations',
  'online_ordering',
  'order_types',
  'payment_types',
  'qr_ordering',
  'report_groups',
  'special_pricing',
  'taxes',
  // Equipment information
  'cash_drawers',
  'devices_labeled',
  'guest_check_printers',
  'handheld_setup',
  'kitchen_display_setup',
  'kitchen_printers_setup',
  'pos_stations_setup',
  'remote_access_added',
  // On-location dates
  'targeted_go_live',
  'actual_go_live',
  'targeted_installation',
  'actual_installation',
  'targeted_training',
  'actual_training',
  // Projectss information
  'added_to_crm',
] as const

/** Task property names only (excludes project_name, client_name, mapping, hs_*, poc, description). Used by sync to create milestones. */
export const TASK_PROPERTY_NAMES: readonly string[] = PROJECT_AND_TASK_PROPERTIES.filter(
  (p) =>
    ![
      'project_name',
      'client_name',
      'hs_object_id',
      'hs_pipeline',
      'hs_pipeline_stage',
      'hs_createdate',
      'hs_lastmodifieddate',
      'mapped_company',
      'mapped_contact',
      'mapped_project',
      'poc___email',
      'project_description',
    ].includes(p)
)

/** Human-readable labels for task properties (optional, for display) */
export const TASK_PROPERTY_LABELS: Record<string, string> = {
  equipment_ordered: 'Equipment Ordered',
  equipment_received: 'Equipment Received',
  onboarding_and_one_time_fees_charged: 'Onboarding and One-time Fees Charged',
  processing_application_submitted: 'Processing Application Submitted',
  subscription_created: 'Subscription Created',
  customers_and_loyalty_imported: 'Customers and Loyalty Imported',
  floor_plans_: 'Floor Plan(s)',
  food_menu: 'Food Menu',
  gift_cards: 'Gift Cards',
  gift_cards_imported: 'Gift Cards Imported',
  jobs_and_job_permissions: 'Jobs and Job Permissions',
  liquor_menu: 'Liquor Menu',
  loyalty: 'Loyalty',
  modifiers: 'Modifiers',
  n3rd_party_integrations: '3rd Party Integrations',
  online_ordering: 'Online Ordering',
  order_types: 'Order Types',
  payment_types: 'Payment Types',
  qr_ordering: 'QR Ordering',
  report_groups: 'Report Groups',
  special_pricing: 'Special Pricing',
  taxes: 'Taxes',
  cash_drawers: 'Cash Drawers Setup',
  devices_labeled: 'Devices Labeled',
  guest_check_printers: 'Guest Check Printers Setup',
  handheld_setup: 'Handheld Setup',
  kitchen_display_setup: 'Kitchen Display Setup',
  kitchen_printers_setup: 'Kitchen Printers Setup',
  pos_stations_setup: 'POS Station Setup',
  remote_access_added: 'Remote Access Added',
  targeted_go_live: 'Targeted Go-Live',
  actual_go_live: 'Actual Go-Live',
  targeted_installation: 'Targeted Installation',
  actual_installation: 'Actual Installation',
  targeted_training: 'Targeted Training',
  actual_training: 'Actual Training',
  added_to_crm: 'Added to CRM',
}

function getAccessToken(): string {
  const token = process.env.HUBSPOT_DEVELOPER_API_KEY
  if (!token) {
    throw new Error('HUBSPOT_DEVELOPER_API_KEY is required for Project tracking')
  }
  return token
}

async function hubspotFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const token = getAccessToken()
  const url = new URL(path, HUBSPOT_API_BASE)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = data.message || data.errors?.[0]?.message || res.statusText
    throw new Error(`HubSpot API ${res.status}: ${message}`)
  }
  return data as T
}

/** List Project tracking records (paginated) */
export async function listProjectTrackingRecords(options?: { limit?: number; after?: string }) {
  const limit = options?.limit ?? 20
  const params: Record<string, string> = {
    limit: String(limit),
    properties: [...PROJECT_AND_TASK_PROPERTIES].join(','),
  }
  if (options?.after) params.after = options.after

  const data = await hubspotFetch<{
    results: Array<{ id: string; properties: Record<string, string>; createdAt: string; updatedAt: string }>
    paging?: { next?: { after: string } }
  }>(`/crm/v3/objects/${PROJECT_TRACKING_OBJECT_TYPE}`, params)

  return {
    results: data.results || [],
    nextAfter: data.paging?.next?.after,
  }
}

/** Get a single Project tracking record by ID with all task properties */
export async function getProjectTrackingRecord(recordId: string) {
  const params = {
    properties: [...PROJECT_AND_TASK_PROPERTIES].join(','),
  }
  const data = await hubspotFetch<{
    id: string
    properties: Record<string, string>
    createdAt: string
    updatedAt: string
  }>(`/crm/v3/objects/${PROJECT_TRACKING_OBJECT_TYPE}/${recordId}`, params)

  return data
}

/** Shape a raw record into project + tasks array for display */
export function projectTrackingToProjectAndTasks(record: {
  id: string
  properties: Record<string, string>
  createdAt: string
  updatedAt: string
}) {
  const { id, properties, createdAt, updatedAt } = record
  const projectName = properties.project_name || '(Unnamed project)'
  const taskPropertyNames = [...TASK_PROPERTY_NAMES]

  const tasks = taskPropertyNames.map((internalName) => ({
    internalName,
    label: TASK_PROPERTY_LABELS[internalName] || internalName,
    value: properties[internalName] ?? '',
  }))

  return {
    id,
    projectName,
    clientName: properties.client_name || null,
    pipeline: properties.hs_pipeline || null,
    pipelineStage: properties.hs_pipeline_stage || null,
    mappedCompany: properties.mapped_company || null,
    mappedContact: properties.mapped_contact || null,
    mappedProject: properties.mapped_project || null,
    createdAt: properties.hs_createdate || createdAt,
    updatedAt: properties.hs_lastmodifieddate || updatedAt,
    tasks,
    rawProperties: properties,
  }
}
