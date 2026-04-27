import { prisma } from '@/lib/prisma'

interface CreateAuditLogParams {
  action: string
  entity: string
  entityId: string
  userId?: string
  payload?: any
}

export async function createAuditLog({
  action,
  entity,
  entityId,
  userId,
  payload,
}: CreateAuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        userId,
        payload,
      },
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
  }
}
