/**
 * Sync HubSpot Project tracking records into our Project and Milestone models.
 * Fetches all records from HubSpot (paginated), upserts Projects by hubspotProjectTrackingId,
 * and upserts Milestones from task properties (by projectId + sourceId).
 */

import { prisma } from '@/lib/db'
import { listProjectTrackingRecords } from '@/lib/hubspot/project-tracking'
import { TASK_PROPERTY_LABELS, TASK_PROPERTY_NAMES } from '@/lib/hubspot/project-tracking'
import type { MilestoneStatus } from '@prisma/client'

const DEFAULT_CUSTOMER_EMAIL = 'hubspot-sync@local'

/** HubSpot enum values that mean "done" -> COMPLETED */
const COMPLETED_VALUES = new Set([
  'true',
  'yes',
  'yes (true)',
  'completed',
  'added',
  'setup',
  'not applicable',
])

function deriveCustomerEmail(properties: Record<string, string | null>): string {
  const poc = (properties.poc___email ?? '').trim()
  if (poc && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(poc)) return poc
  const mapped = (properties.mapped_contact ?? '').trim()
  if (mapped && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mapped)) return mapped
  return DEFAULT_CUSTOMER_EMAIL
}

function hubspotValueToMilestoneStatus(value: string | null | undefined): MilestoneStatus {
  if (value == null || value === '') return 'PENDING'
  const normalized = String(value).toLowerCase().trim()
  if (COMPLETED_VALUES.has(normalized)) return 'COMPLETED'
  if (normalized === 'not relevant' || normalized === 'not applicable') return 'PENDING'
  return 'PENDING'
}

export interface SyncResult {
  projectsCreated: number
  projectsUpdated: number
  milestonesCreated: number
  milestonesUpdated: number
  error?: string
}

export async function runHubSpotProjectSync(): Promise<SyncResult> {
  const result: SyncResult = {
    projectsCreated: 0,
    projectsUpdated: 0,
    milestonesCreated: 0,
    milestonesUpdated: 0,
  }

  let after: string | undefined
  const limit = 100

  do {
    const { results, nextAfter } = await listProjectTrackingRecords({ limit, after })

    for (const record of results) {
      const props = record.properties as Record<string, string | null>
      const hubspotId = record.id
      const name = (props.project_name ?? '(Unnamed project)').trim() || '(Unnamed project)'
      const customerEmail = deriveCustomerEmail(props)
      const description = (props.project_description ?? '').trim() || null

      const existing = await prisma.project.findUnique({
        where: { hubspotProjectTrackingId: hubspotId },
        select: { id: true },
      })

      let projectId: string
      if (existing) {
        await prisma.project.update({
          where: { id: existing.id },
          data: { name, customerEmail, description },
        })
        projectId = existing.id
        result.projectsUpdated += 1
      } else {
        const created = await prisma.project.create({
          data: {
            name,
            customerEmail,
            description,
            hubspotProjectTrackingId: hubspotId,
          },
        })
        projectId = created.id
        result.projectsCreated += 1
      }

      for (let order = 0; order < TASK_PROPERTY_NAMES.length; order++) {
        const sourceId = TASK_PROPERTY_NAMES[order]
        const label = TASK_PROPERTY_LABELS[sourceId] ?? sourceId
        const value = props[sourceId] ?? ''
        const status = hubspotValueToMilestoneStatus(value)
        const completedDate = status === 'COMPLETED' ? new Date() : null

        const existingMilestone = await prisma.milestone.findFirst({
          where: { projectId, sourceId },
          select: { id: true },
        })

        if (existingMilestone) {
          await prisma.milestone.update({
            where: { id: existingMilestone.id },
            data: { name: label, status, order, completedDate },
          })
          result.milestonesUpdated += 1
        } else {
          await prisma.milestone.create({
            data: {
              projectId,
              name: label,
              sourceId,
              status,
              order,
              completedDate,
            },
          })
          result.milestonesCreated += 1
        }
      }
    }

    after = nextAfter ?? undefined
  } while (after)

  return result
}
