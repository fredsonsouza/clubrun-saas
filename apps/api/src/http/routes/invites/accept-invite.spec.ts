import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    invite: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    member: {
      create: vi.fn(),
    },
    $transaction: vi.fn((actions) => Promise.all(actions)),
  },
}))

describe('Accept Invite (Unit)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be able to accept an invite', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const inviteId = '81f02179-8d75-474c-8975-c54d8b965c4d'
    const clubId = '515560b4-367d-44a6-89bf-ba486e9e46a7'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      email: 'johndoe@example.com',
      isSystemAdmin: false,
      athleteProfile: { isPremium: true },
      clubsOwned: [],
      members_on: [],
    } as any)

    vi.mocked(prisma.invite.findUnique).mockResolvedValue({
      id: inviteId,
      email: 'johndoe@example.com',
      clubId,
      role: 'ATHLETE',
    } as any)

    const response = await app.inject({
      method: 'POST',
      url: `/invites/${inviteId}/accept`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(204)
    expect(prisma.member.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId,
          clubId,
        }),
      })
    )
  })

  it('returns 403 when a non-premium user accepts an athlete invite', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const inviteId = '81f02179-8d75-474c-8975-c54d8b965c4d'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      email: 'johndoe@example.com',
      isSystemAdmin: false,
      athleteProfile: { isPremium: false },
      clubsOwned: [],
      members_on: [],
    } as any)
    vi.mocked(prisma.invite.findUnique).mockResolvedValue({
      id: inviteId,
      email: 'johndoe@example.com',
      clubId: '515560b4-367d-44a6-89bf-ba486e9e46a7',
      role: 'ATHLETE',
    } as any)

    const response = await app.inject({
      method: 'POST',
      url: `/invites/${inviteId}/accept`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(403)
    expect(prisma.member.create).not.toHaveBeenCalled()
    expect(prisma.invite.delete).not.toHaveBeenCalled()
  })

  it('should not be able to accept an invite belonging to another email', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const inviteId = '81f02179-8d75-474c-8975-c54d8b965c4d'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: userId,
      email: 'johndoe@example.com',
    } as any)

    vi.mocked(prisma.invite.findUnique).mockResolvedValue({
      id: inviteId,
      email: 'wrong@example.com',
    } as any)

    const response = await app.inject({
      method: 'POST',
      url: `/invites/${inviteId}/accept`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().message).toBe('This invite belongs to another user.')
  })
})
