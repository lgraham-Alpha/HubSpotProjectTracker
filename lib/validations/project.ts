import { z } from 'zod'

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  customerEmail: z.string().email('Invalid email address'),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  expectedCompletionDate: z.string().datetime().optional().nullable(),
  hubspotDealId: z.string().optional().nullable(),
  hubspotContactId: z.string().optional().nullable(),
})

export const createMilestoneSchema = z.object({
  name: z.string().min(1, 'Milestone name is required'),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'SCHEDULED', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'BLOCKED', 'CHANGES_REQUESTED']).optional(),
  targetDate: z.string().datetime().optional().nullable(),
  order: z.number().int().optional(),
  prerequisiteMilestoneIds: z.array(z.string()).optional(),
})

export const updateMilestoneSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'SCHEDULED', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'BLOCKED', 'CHANGES_REQUESTED']).optional(),
  targetDate: z.string().datetime().optional().nullable(),
  completedDate: z.string().datetime().optional().nullable(),
  order: z.number().int().optional(),
  prerequisiteMilestoneIds: z.array(z.string()).optional(),
})

export const createTokenSchema = z.object({
  customerEmail: z.string().email('Invalid email address'),
})
