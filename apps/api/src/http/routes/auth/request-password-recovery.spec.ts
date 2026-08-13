import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/mail', () => ({
  resend: { emails: { send: vi.fn().mockResolvedValue({}) } },
}))
vi.mock('@/lib/prisma', () => {
  const prisma = {
    user: { findUnique: vi.fn() },
    token: { updateMany: vi.fn(), create: vi.fn() },
    emailOutbox: { upsert: vi.fn() },
    $transaction: vi.fn(async (callback: (tx: any) => unknown) =>
      callback(prisma)
    ),
  }
  return { prisma }
})

describe('Request Password Recovery (Unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prisma.token.updateMany).mockResolvedValue({ count: 1 })
    vi.mocked(prisma.token.create).mockResolvedValue({} as any)
    vi.mocked(prisma.emailOutbox.upsert).mockResolvedValue({
      id: 'email-id',
    } as any)
  })

  it('normalizes the e-mail, revokes prior recovery tokens and stores digest only', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-id',
    } as any)

    const response = await app.inject({
      method: 'POST',
      url: '/password/recovery',
      body: { email: '  John@Example.COM ' },
    })

    expect(response.statusCode).toBe(201)
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'john@example.com' },
      select: { id: true },
    })
    expect(prisma.token.updateMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-id',
        type: 'PASSWORD_RECOVER',
        consumedAt: null,
      },
      data: { consumedAt: expect.any(Date) },
    })
    expect(prisma.token.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        digest: expect.stringMatching(/^[a-f0-9]{64}$/),
        type: 'PASSWORD_RECOVER',
        expiresAt: expect.any(Date),
        userId: 'user-id',
      }),
    })
    expect(
      vi.mocked(prisma.token.create).mock.calls[0][0].data
    ).not.toHaveProperty('code')
  })

  it('returns the same generic response when the user does not exist', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const response = await app.inject({
      method: 'POST',
      url: '/password/recovery',
      body: { email: 'unknown@example.com' },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toBeNull()
    expect(prisma.token.create).not.toHaveBeenCalled()
  })
})
