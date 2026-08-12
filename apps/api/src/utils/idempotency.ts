import { createHash } from 'node:crypto'

import type { PrismaClient } from '../../generated/prisma/client'
import { ConflictError } from '../http/routes/_errors/conflict-error'

type DbClient = Pick<PrismaClient, 'idempotencyRecord'>

export function getIdempotencyKey(value: string | string[] | undefined) {
  const key = Array.isArray(value) ? value[0] : value
  const normalized = key?.trim()
  if (!normalized) return null
  if (normalized.length < 8 || normalized.length > 255) {
    throw new ConflictError(
      'Idempotency-Key must contain between 8 and 255 characters.'
    )
  }
  return normalized
}

export function hashIdempotencyValue(value: unknown) {
  return createHash('sha256')
    .update(JSON.stringify(sortObject(value)))
    .digest('hex')
}

function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortObject)
  if (value && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((result, key) => {
        result[key] = sortObject((value as Record<string, unknown>)[key])
        return result
      }, {})
  }
  return value
}

export async function startIdempotentCommand(
  db: DbClient,
  input: {
    principalKey: string
    scope: string
    key: string | null
    payload: unknown
  }
) {
  if (!input.key) return null

  const keyHash = hashIdempotencyValue(input.key)
  const requestHash = hashIdempotencyValue(input.payload)
  const existing = await db.idempotencyRecord.findUnique({
    where: {
      principalKey_scope_keyHash: {
        principalKey: input.principalKey,
        scope: input.scope,
        keyHash,
      },
    },
  })

  if (existing) {
    if (existing.requestHash !== requestHash) {
      throw new ConflictError('IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD')
    }
    if (existing.status === 'COMPLETED' && existing.resourceId) {
      return { replayResourceId: existing.resourceId }
    }
    throw new ConflictError('IDEMPOTENCY_COMMAND_IN_PROGRESS')
  }

  try {
    await db.idempotencyRecord.create({
      data: {
        principalKey: input.principalKey,
        scope: input.scope,
        keyHash,
        requestHash,
        status: 'PROCESSING',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })
  } catch (_error) {
    throw new ConflictError('IDEMPOTENCY_COMMAND_IN_PROGRESS')
  }
  return { keyHash, requestHash }
}

export async function completeIdempotentCommand(
  db: DbClient,
  input: {
    principalKey: string
    scope: string
    key: string
    resourceId: string
    responseCode?: number
  }
) {
  await db.idempotencyRecord.updateMany({
    where: {
      principalKey: input.principalKey,
      scope: input.scope,
      keyHash: hashIdempotencyValue(input.key),
      status: 'PROCESSING',
    },
    data: {
      status: 'COMPLETED',
      resourceId: input.resourceId,
      responseCode: input.responseCode ?? 201,
    },
  })
}
