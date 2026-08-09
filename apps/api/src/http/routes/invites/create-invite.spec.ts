import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    member: {
      findFirst: vi.fn(),
    },
    invite: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

describe('Create Invite (Unit)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be able to create a new invite', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValueOnce({
      id: 'member-id',
      userId,
      role: 'ADMIN',
      club: { id: '515560b4-367d-44a6-89bf-ba486e9e46a7', slug: 'acme-club' },
    } as any)

    vi.mocked(prisma.invite.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.member.findFirst).mockResolvedValueOnce(null) // second call for existing member

    vi.mocked(prisma.invite.create).mockResolvedValue({
      id: '81f02179-8d75-474c-8975-c54d8b965c4d',
    } as any)

    const response = await app.inject({
      method: 'POST',
      url: '/clubs/acme-club/invites',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        email: 'johndoe@example.com',
        role: 'ATHLETE',
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toEqual({
      inviteId: '81f02179-8d75-474c-8975-c54d8b965c4d',
    })
  })

  it('should not be able to create an invite if already redirected by domain', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'member-id',
      userId,
      role: 'ADMIN',
      club: {
        id: '515560b4-367d-44a6-89bf-ba486e9e46a7',
        slug: 'acme-club',
        shouldAttachUsersByDomain: true,
        domain: 'example.com',
      },
    } as any)

    const response = await app.inject({
      method: 'POST',
      url: '/clubs/acme-club/invites',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        email: 'johndoe@example.com',
        role: 'ATHLETE',
      },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().message).toContain(
      'will join your club automatically'
    )
  })

  it('should reject administrative invites from a non-owner admin', async () => {
    const adminId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: adminId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'admin-member-id',
      userId: adminId,
      role: 'ADMIN',
      club: {
        id: '515560b4-367d-44a6-89bf-ba486e9e46a7',
        slug: 'acme-club',
        ownerId: 'real-owner-id',
      },
    } as any)

    const response = await app.inject({
      method: 'POST',
      url: '/clubs/acme-club/invites',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        email: 'manager@example.com',
        role: 'MANAGER',
      },
    })

    expect(response.statusCode).toBe(403)
    expect(prisma.invite.create).not.toHaveBeenCalled()
  })

  it('should reject VISITOR as a persisted invite role', async () => {
    const adminId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: adminId })

    const response = await app.inject({
      method: 'POST',
      url: '/clubs/acme-club/invites',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        email: 'visitor@example.com',
        role: 'VISITOR',
      },
    })

    expect(response.statusCode).toBe(400)
    expect(prisma.invite.create).not.toHaveBeenCalled()
  })
})
