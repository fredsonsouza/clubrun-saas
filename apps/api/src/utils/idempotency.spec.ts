import { describe, expect, it, vi } from 'vitest'
import {
  completeIdempotentCommand,
  hashIdempotencyValue,
  startIdempotentCommand,
} from './idempotency'

function createDb() {
  return {
    idempotencyRecord: {
      findUnique: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
    },
  } as any
}

describe('idempotency commands', () => {
  it('replays the stored resource for the same key and payload', async () => {
    const db = createDb()
    db.idempotencyRecord.findUnique.mockResolvedValue({
      requestHash: hashIdempotencyValue({ name: 'Race' }),
      status: 'COMPLETED',
      resourceId: 'resource-id',
    })
    const first = await startIdempotentCommand(db, {
      principalKey: 'user-id',
      scope: 'club:club-id:race:create',
      key: 'request-key-1',
      payload: { name: 'Race' },
    })
    expect(first).toEqual({ replayResourceId: 'resource-id' })
  })

  it('rejects the same key with a different payload', async () => {
    const db = createDb()
    db.idempotencyRecord.findUnique.mockResolvedValue({
      requestHash: 'different-hash',
      status: 'COMPLETED',
      resourceId: 'resource-id',
    })
    await expect(
      startIdempotentCommand(db, {
        principalKey: 'user-id',
        scope: 'club:club-id:race:create',
        key: 'request-key-1',
        payload: { name: 'Other Race' },
      })
    ).rejects.toThrow('IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD')
  })

  it('marks a command completed with only its processing row', async () => {
    const db = createDb()
    await completeIdempotentCommand(db, {
      principalKey: 'user-id',
      scope: 'club:club-id:workout:create',
      key: 'request-key-1',
      resourceId: 'workout-id',
    })
    expect(db.idempotencyRecord.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'COMPLETED',
          resourceId: 'workout-id',
        }),
      })
    )
  })
})
