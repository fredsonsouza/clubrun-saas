import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import {
  consumeOAuthAttemptInTransaction,
  createPkceChallenge,
} from '@/utils/oauth'
import { sha256 } from '@/utils/tokens'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    oAuthAttempt: { create: vi.fn() },
  },
}))

const state = 'random-oauth-state-with-at-least-32-characters'
const verifier = 'a'.repeat(43)

describe('OAuth attempts', () => {
  beforeEach(() => vi.clearAllMocks())

  it('stores only the state digest with a 10 minute expiry', async () => {
    vi.mocked(prisma.oAuthAttempt.create).mockResolvedValue({} as any)

    const before = Date.now()
    const response = await app.inject({
      method: 'POST',
      url: '/oauth/attempts',
      body: { state, pkceChallenge: createPkceChallenge(verifier) },
    })

    expect(response.statusCode).toBe(201)
    const data = vi.mocked(prisma.oAuthAttempt.create).mock.calls[0][0].data
    expect(data.stateDigest).toBe(sha256(state))
    expect(data).not.toHaveProperty('state')
    expect(new Date(data.expiresAt).getTime()).toBeGreaterThanOrEqual(
      before + 600_000
    )
  })

  it('validates PKCE and conditionally consumes an attempt exactly once', async () => {
    const tx = {
      oAuthAttempt: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'attempt-id',
          pkceChallenge: createPkceChallenge(verifier),
          expiresAt: new Date(Date.now() + 60_000),
          consumedAt: null,
        }),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    }

    await expect(
      consumeOAuthAttemptInTransaction(tx, state, verifier)
    ).resolves.toBe(true)
    expect(tx.oAuthAttempt.updateMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        id: 'attempt-id',
        stateDigest: sha256(state),
        consumedAt: null,
        expiresAt: { gt: expect.any(Date) },
      }),
      data: { consumedAt: expect.any(Date) },
    })
  })

  it.each([
    ['expired', { expiresAt: new Date(Date.now() - 1), consumedAt: null }, verifier],
    ['consumed', { expiresAt: new Date(Date.now() + 60_000), consumedAt: new Date() }, verifier],
    ['wrong verifier', { expiresAt: new Date(Date.now() + 60_000), consumedAt: null }, 'b'.repeat(43)],
  ])('rejects an %s attempt', async (_label, overrides, suppliedVerifier) => {
    const tx = {
      oAuthAttempt: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'attempt-id',
          pkceChallenge: createPkceChallenge(verifier),
          ...overrides,
        }),
        updateMany: vi.fn(),
      },
    }

    await expect(
      consumeOAuthAttemptInTransaction(tx, state, suppliedVerifier)
    ).resolves.toBe(false)
    expect(tx.oAuthAttempt.updateMany).not.toHaveBeenCalled()
  })
})
