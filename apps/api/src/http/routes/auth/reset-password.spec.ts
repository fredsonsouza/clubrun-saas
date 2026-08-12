import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/utils/identity'
import { sha256 } from '@/utils/tokens'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/utils/identity', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/utils/identity')>()),
  hashPassword: vi.fn(),
}))
vi.mock('@/lib/prisma', () => {
  const prisma = {
    token: { findUnique: vi.fn(), updateMany: vi.fn() },
    user: { update: vi.fn() },
    $transaction: vi.fn(async (callback: (tx: any) => unknown) =>
      callback(prisma)
    ),
  }
  return { prisma }
})

const rawToken = 'valid-reset-token-that-is-long-enough-123'

function validToken(overrides: Record<string, unknown> = {}) {
  return {
    id: 'token-id',
    userId: 'user-id',
    type: 'PASSWORD_RECOVER',
    expiresAt: new Date(Date.now() + 60_000),
    consumedAt: null,
    ...overrides,
  }
}

describe('Reset Password (Unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(hashPassword).mockResolvedValue('new-argon2id-hash')
    vi.mocked(prisma.token.updateMany).mockResolvedValue({ count: 1 })
    vi.mocked(prisma.user.update).mockResolvedValue({} as any)
  })

  it('conditionally consumes the typed token, revokes all tokens and sessions', async () => {
    vi.mocked(prisma.token.findUnique).mockResolvedValue(validToken() as any)

    const response = await app.inject({
      method: 'POST',
      url: '/password/reset',
      body: { code: rawToken, password: 'new-password-123' },
    })

    expect(response.statusCode).toBe(204)
    expect(prisma.token.findUnique).toHaveBeenCalledWith({
      where: { digest: sha256(rawToken) },
      select: expect.any(Object),
    })
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-id' },
      data: {
        passwordHash: 'new-argon2id-hash',
        sessionVersion: { increment: 1 },
      },
    })
    expect(prisma.token.updateMany).toHaveBeenLastCalledWith({
      where: { userId: 'user-id', consumedAt: null },
      data: { consumedAt: expect.any(Date) },
    })
  })

  it.each([
    ['missing', null],
    ['wrong type', validToken({ type: 'EMAIL_VERIFICATION' })],
    ['expired', validToken({ expiresAt: new Date(Date.now() - 1_000) })],
    ['consumed', validToken({ consumedAt: new Date() })],
  ])('rejects a %s token', async (_label, token) => {
    vi.mocked(prisma.token.findUnique).mockResolvedValue(token as any)

    const response = await app.inject({
      method: 'POST',
      url: '/password/reset',
      body: { code: rawToken, password: 'new-password-123' },
    })

    expect(response.statusCode).toBe(401)
    expect(prisma.user.update).not.toHaveBeenCalled()
  })

  it('enforces the central 12 character password policy', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/password/reset',
      body: { code: rawToken, password: 'too-short' },
    })

    expect(response.statusCode).toBe(400)
    expect(prisma.token.findUnique).not.toHaveBeenCalled()
  })
})
