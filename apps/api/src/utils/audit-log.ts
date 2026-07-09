import { prisma } from '@/lib/prisma'

interface CreateAuditLogParams {
  action: string
  entity: string
  entityId: string
  userId?: string
  payload?: any
}

export function createAuditLog({
  action,
  entity,
  entityId,
  userId,
  payload,
}: CreateAuditLogParams): void {
  setImmediate(() => {
    // Defensive checks for unit test environments
    if (
      !prisma ||
      !prisma.auditLog ||
      typeof prisma.auditLog.create !== 'function'
    ) {
      return
    }

    try {
      const promise = prisma.auditLog.create({
        data: {
          action,
          entity,
          entityId,
          userId,
          payload,
        },
      })

      if (promise && typeof promise.catch === 'function') {
        promise.catch((error) => {
          console.error('Failed to create audit log in background:', error)
        })
      }
    } catch (error) {
      console.error('Failed to initiate audit log creation:', error)
    }
  })
}
