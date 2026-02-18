import { Milestone, MilestoneStatus } from '@prisma/client'

export type RiskLevel = 'green' | 'yellow' | 'red'

export interface MilestoneWithRisk extends Milestone {
  riskLevel?: RiskLevel
  isBlocked?: boolean
  blockingItems?: string[]
}

/**
 * Calculate risk level based on prerequisites and timeline
 * Green: Prerequisites met and scheduled in future
 * Yellow: Prerequisites unmet, >7 days out OR unmet but not urgent
 * Red: Prerequisites unmet and ≤48 hours out
 */
export function computeScheduleRisk(
  milestone: Milestone,
  allMilestones: Milestone[]
): RiskLevel | null {
  // If already completed, no risk
  if (milestone.status === 'COMPLETED') {
    return null
  }

  // Check if prerequisites are met
  const prerequisitesMet = checkPrerequisites(milestone, allMilestones)

  // If no target date, can't calculate risk
  if (!milestone.targetDate) {
    return prerequisitesMet ? 'green' : 'yellow'
  }

  const now = new Date()
  const targetDate = new Date(milestone.targetDate)
  const hoursUntilTarget = (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60)
  const daysUntilTarget = hoursUntilTarget / 24

  // Prerequisites met and scheduled in future = Green
  if (prerequisitesMet && daysUntilTarget > 0) {
    return 'green'
  }

  // Prerequisites unmet
  if (!prerequisitesMet) {
    // ≤48 hours out = Red (urgent)
    if (daysUntilTarget <= 2) {
      return 'red'
    }
    // >7 days out = Yellow (not urgent yet)
    if (daysUntilTarget > 7) {
      return 'yellow'
    }
    // 2-7 days out = Yellow (moderate urgency)
    return 'yellow'
  }

  // Default to green if prerequisites met
  return 'green'
}

/**
 * Check if all prerequisite milestones are completed
 */
export function checkPrerequisites(
  milestone: Milestone,
  allMilestones: Milestone[]
): boolean {
  // Parse prerequisite IDs from JSON
  let prerequisiteIds: string[] = []
  if (milestone.prerequisiteMilestoneIds) {
    try {
      prerequisiteIds = Array.isArray(milestone.prerequisiteMilestoneIds)
        ? milestone.prerequisiteMilestoneIds
        : JSON.parse(milestone.prerequisiteMilestoneIds as string)
    } catch {
      prerequisiteIds = []
    }
  }

  if (!prerequisiteIds || prerequisiteIds.length === 0) {
    return true // No prerequisites = always met
  }

  // Find all prerequisite milestones
  const prerequisites = allMilestones.filter(m =>
    prerequisiteIds.includes(m.id)
  )

  // All prerequisites must be completed
  return prerequisites.every(m => m.status === 'COMPLETED')
}

/**
 * Get list of blocking items (prerequisites that aren't completed)
 */
export function getBlockingItems(
  milestone: Milestone,
  allMilestones: Milestone[]
): string[] {
  // Parse prerequisite IDs from JSON
  let prerequisiteIds: string[] = []
  if (milestone.prerequisiteMilestoneIds) {
    try {
      prerequisiteIds = Array.isArray(milestone.prerequisiteMilestoneIds)
        ? milestone.prerequisiteMilestoneIds
        : JSON.parse(milestone.prerequisiteMilestoneIds as string)
    } catch {
      prerequisiteIds = []
    }
  }

  if (!prerequisiteIds || prerequisiteIds.length === 0) {
    return []
  }

  const prerequisites = allMilestones.filter(m =>
    prerequisiteIds.includes(m.id)
  )

  const incompletePrerequisites = prerequisites.filter(m => m.status !== 'COMPLETED')

  return incompletePrerequisites.map(m => m.name)
}

/**
 * Get all blocking items for a project
 */
export function getNextBlockingItems(milestones: Milestone[]): string[] {
  const blockingItems: string[] = []

  for (const milestone of milestones) {
    // Only check milestones that are not completed
    if (milestone.status !== 'COMPLETED') {
      const items = getBlockingItems(milestone, milestones)
      if (items.length > 0) {
        blockingItems.push(...items)
      }
    }
  }

  // Remove duplicates (Array.from for ES5 target compatibility)
  return Array.from(new Set(blockingItems))
}

/**
 * Check if milestone is blocked by prerequisites
 */
export function isMilestoneBlocked(
  milestone: Milestone,
  allMilestones: Milestone[]
): boolean {
  return !checkPrerequisites(milestone, allMilestones) && milestone.status !== 'COMPLETED'
}
