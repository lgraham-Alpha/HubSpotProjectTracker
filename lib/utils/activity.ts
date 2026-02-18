import { prisma } from '@/lib/db'

export async function logActivity(
  projectId: string,
  type: string,
  message: string,
  metadata?: Record<string, any>
) {
  await prisma.activityLog.create({
    data: {
      projectId,
      type,
      message,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  })
}
