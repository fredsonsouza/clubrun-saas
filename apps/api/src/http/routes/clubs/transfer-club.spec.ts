import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    member: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    club: {
      update: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn((arg) => {
      if (typeof arg === 'function') {
        return arg(prisma)
      }
      return Promise.all(arg)
    }),
  },
}))

describe('Transfer Club Ownership (Unit)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be able to transfer club ownership', async () => {
    const ownerId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const targetUserId = '515560b4-367d-44a6-89bf-ba486e9e46a7'
    const token = app.jwt.sign({ sub: ownerId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'owner-member-id',
      userId: ownerId,
      role: 'OWNER',
      club: { id: 'club-id', slug: 'acme-club', ownerId },
    } as any)

    vi.mocked(prisma.member.findUnique).mockResolvedValue({
      id: 'target-member-id',
      userId: targetUserId,
      clubId: 'club-id',
      status: 'ACTIVE',
    } as any)

    vi.mocked(prisma.member.update).mockResolvedValue({} as any)
    vi.mocked(prisma.club.update).mockResolvedValue({} as any)
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any)

    const response = await app.inject({
      method: 'PATCH',
      url: '/clubs/acme-club/owner',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        transferToUserId: targetUserId,
      },
    })

    expect(response.statusCode).toBe(204)
    expect(prisma.club.update).toHaveBeenCalledWith({
      where: { id: 'club-id' },
      data: {
        ownerId: targetUserId,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        subscriptionStatus: 'PENDING_UPDATE',
      },
    })
  })

  it('should not be able to transfer ownership to a non-member', async () => {
    const ownerId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const targetUserId = '515560b4-367d-44a6-89bf-ba486e9e46a7'
    const token = app.jwt.sign({ sub: ownerId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'owner-member-id',
      userId: ownerId,
      role: 'OWNER',
      club: { id: 'club-id', slug: 'acme-club', ownerId },
    } as any)

    vi.mocked(prisma.member.findUnique).mockResolvedValue(null)

    const response = await app.inject({
      method: 'PATCH',
      url: '/clubs/acme-club/owner',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        transferToUserId: targetUserId,
      },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().message).toBe(
      'Target user must be an active member of this club'
    )
  })

  it('should reject a persisted OWNER who is not Club.ownerId', async () => {
    const staleOwnerId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const targetUserId = '515560b4-367d-44a6-89bf-ba486e9e46a7'
    const token = app.jwt.sign({ sub: staleOwnerId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'stale-owner-member-id',
      userId: staleOwnerId,
      role: 'OWNER',
      club: {
        id: 'club-id',
        slug: 'acme-club',
        ownerId: 'real-owner-id',
      },
    } as any)

    const response = await app.inject({
      method: 'PATCH',
      url: '/clubs/acme-club/owner',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        transferToUserId: targetUserId,
      },
    })

    expect(response.statusCode).toBe(403)
    expect(prisma.member.findUnique).not.toHaveBeenCalled()
    expect(prisma.club.update).not.toHaveBeenCalled()
  })
})
