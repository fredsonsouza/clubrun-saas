import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { digestOtp } from '@/utils/tokens'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => {
  const prisma = {
    token: { findFirst: vi.fn(), updateMany: vi.fn() },
    user: { findUnique: vi.fn(), update: vi.fn() },
    invite: { findMany: vi.fn(), deleteMany: vi.fn() },
    club: { findMany: vi.fn() },
    member: { upsert: vi.fn() },
    $transaction: vi.fn(async (callback: (tx: any) => unknown) =>
      callback(prisma)
    ),
  }
  return { prisma }
})

const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
const code = '123456'

describe('Verify email (Unit)', () => {
  beforeAll(() => app.ready())
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prisma.token.findFirst).mockResolvedValue({
      id: 'token-id',
      digest: digestOtp(code, userId, 'EMAIL_VERIFICATION'),
      attempts: 0,
    } as any)
    vi.mocked(prisma.token.updateMany).mockResolvedValue({ count: 1 })
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      email: 'runner@acme.com',
    } as any)
    vi.mocked(prisma.invite.findMany).mockResolvedValue([
      { id: 'invite-1', clubId: 'club-1', role: 'ADMIN' },
      { id: 'invite-2', clubId: 'club-2', role: 'ATHLETE' },
    ] as any)
    vi.mocked(prisma.club.findMany).mockResolvedValue([
      { id: 'club-1' },
      { id: 'club-3' },
    ] as any)
  })

  it('verifies and processes all explicit/domain memberships in one transaction', async () => {
    const token = app.jwt.sign({ sub: userId })
    const response = await app.inject({
      method: 'POST',
      url: '/auth/verify-email',
      headers: { authorization: `Bearer ${token}` },
      body: { code },
    })

    expect(response.statusCode).toBe(204)
    expect(prisma.$transaction).toHaveBeenCalledTimes(1)
    expect(prisma.member.upsert).toHaveBeenCalledTimes(3)
    expect(prisma.member.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          clubId: 'club-1',
          role: 'ADMIN',
          status: 'ACTIVE',
        }),
        update: { role: 'ADMIN', status: 'ACTIVE' },
      })
    )
    expect(prisma.member.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          clubId: 'club-3',
          role: 'ATHLETE',
          status: 'PENDING',
        }),
        update: {},
      })
    )
    expect(prisma.invite.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ['invite-1', 'invite-2'] } },
    })
  })
})
