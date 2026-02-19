import { z } from 'zod'

/** Accepts ISO 8601 datetime or date-only YYYY-MM-DD (e.g. from <input type="date">). */
const optionalDateStringSchema = z
  .union([
    z.string().datetime(),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Use YYYY-MM-DD or full ISO datetime' }),
  ])
  .optional()
  .nullable()

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
  targetDate: optionalDateStringSchema,
  order: z.number().int().optional(),
  prerequisiteMilestoneIds: z.array(z.string()).optional(),
})

export const updateMilestoneSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'SCHEDULED', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'BLOCKED', 'CHANGES_REQUESTED']).optional(),
  targetDate: optionalDateStringSchema,
  completedDate: optionalDateStringSchema,
  order: z.number().int().optional(),
  prerequisiteMilestoneIds: z.array(z.string()).optional(),
})

export const createTokenSchema = z.object({
  customerEmail: z.string().email('Invalid email address'),
})
