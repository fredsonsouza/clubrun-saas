import { describe, expect, it, vi } from 'vitest'
import { enqueueEmail, processPendingEmail } from './email'

function createDb() {
  const emailOutbox = {
    upsert: vi.fn().mockResolvedValue({ id: 'outbox-id' }),
    findFirst: vi.fn(),
    updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    update: vi.fn().mockResolvedValue({}),
  }
  return { emailOutbox }
}

describe('Email outbox', () => {
  it('deduplicates the same delivery intent with an idempotency key', async () => {
    const db = createDb()

    await enqueueEmail(db, {
      userId: 'user-id',
      to: 'athlete@example.com',
      template: 'EMAIL_VERIFICATION',
      payload: { name: 'Athlete', code: '123456' },
      idempotencyKey: 'verification:user-id:hash',
    })

    expect(db.emailOutbox.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { idempotencyKey: 'verification:user-id:hash' },
        update: {},
      })
    )
  })

  it('marks a delivery as sent after the provider accepts it', async () => {
    const db = createDb()
    db.emailOutbox.findFirst.mockResolvedValue({
      id: 'outbox-id',
      status: 'PENDING',
      attempts: 0,
      nextAttemptAt: new Date(0),
      createdAt: new Date(0),
      toAddress: 'athlete@example.com',
      template: 'EMAIL_VERIFICATION',
      payload: { name: 'Athlete', code: '123456' },
    })
    const provider = { send: vi.fn().mockResolvedValue(undefined) }

    await expect(
      processPendingEmail(db, provider, new Date(1_000))
    ).resolves.toBe(true)
    expect(provider.send).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'athlete@example.com' })
    )
    expect(db.emailOutbox.update).toHaveBeenLastCalledWith({
      where: { id: 'outbox-id' },
      data: { status: 'SENT', sentAt: expect.any(Date), lastError: null },
    })
  })

  it('redacts provider errors and schedules a retry', async () => {
    const db = createDb()
    db.emailOutbox.findFirst.mockResolvedValue({
      id: 'outbox-id',
      status: 'FAILED',
      attempts: 1,
      nextAttemptAt: new Date(0),
      createdAt: new Date(0),
      toAddress: 'athlete@example.com',
      template: 'PASSWORD_RECOVERY',
      payload: { resetUrl: 'https://app.example/reset?code=secret' },
    })
    const provider = {
      send: vi.fn().mockRejectedValue(new Error('token-secret')),
    }

    await expect(
      processPendingEmail(db, provider, new Date(1_000))
    ).resolves.toBe(false)
    expect(db.emailOutbox.update).toHaveBeenLastCalledWith({
      where: { id: 'outbox-id' },
      data: expect.objectContaining({
        status: 'FAILED',
        lastError: 'Email provider delivery failed',
        nextAttemptAt: expect.any(Date),
      }),
    })
    expect(JSON.stringify(db.emailOutbox.update.mock.calls)).not.toContain(
      'token-secret'
    )
  })
})
