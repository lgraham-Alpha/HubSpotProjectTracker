import { Milestone } from '@prisma/client'

export type RiskLevel = 'green' | 'yellow' | 'red'

export interface MilestoneWithRisk extends Milestone {
  riskLevel?: RiskLevel
  isBlocked?: boolean
  blockingItems?: string[]
}

/** Parse prerequisite milestone IDs from JSON field. */
export function parsePrerequisiteIds(milestone: Milestone): string[] {
  const raw = milestone.prerequisiteMilestoneIds
  if (!raw) return []
  try {
    return Array.isArray(raw) ? raw : JSON.parse(raw as string)
  } catch {
    return []
  }
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

/** Check if all prerequisite milestones are completed. */
export function checkPrerequisites(
  milestone: Milestone,
  allMilestones: Milestone[]
): boolean {
  const prerequisiteIds = parsePrerequisiteIds(milestone)
  if (prerequisiteIds.length === 0) return true
  const prerequisites = allMilestones.filter(m => prerequisiteIds.includes(m.id))
  return prerequisites.every(m => m.status === 'COMPLETED')
}

/** Get list of blocking items (incomplete prerequisites) for a milestone. */
export function getBlockingItems(
  milestone: Milestone,
  allMilestones: Milestone[]
): string[] {
  const prerequisiteIds = parsePrerequisiteIds(milestone)
  if (prerequisiteIds.length === 0) return []
  const prerequisites = allMilestones.filter(m => prerequisiteIds.includes(m.id))
  return prerequisites
    .filter(m => m.status !== 'COMPLETED')
    .map(m => m.name)
}

/** Get all blocking items for a project (unique, from incomplete milestones). */
export function getNextBlockingItems(milestones: Milestone[]): string[] {
  const items: string[] = []
  for (const m of milestones) {
    if (m.status !== 'COMPLETED') items.push(...getBlockingItems(m, milestones))
  }
  return [...new Set(items)]
}

/** True if milestone is not completed and has unmet prerequisites. */
export function isMilestoneBlocked(
  milestone: Milestone,
  allMilestones: Milestone[]
): boolean {
  return !checkPrerequisites(milestone, allMilestones) && milestone.status !== 'COMPLETED'
}
