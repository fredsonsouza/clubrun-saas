import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    club: { findUnique: vi.fn() },
    member: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

describe('Join Club Via Link premium entitlement (Unit)', () => {
  const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'

  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 403 before consuming a link for a non-premium athlete', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      isSystemAdmin: false,
      athleteProfile: null,
      clubsOwned: [],
      members_on: [],
    } as any)

    const response = await app.inject({
      method: 'POST',
      url: '/clubs/test-club/join',
      headers: { authorization: `Bearer ${app.jwt.sign({ sub: userId })}` },
      body: { token: 'invite-token' },
    })

    expect(response.statusCode).toBe(403)
    expect(prisma.member.create).not.toHaveBeenCalled()
  })

  it('creates a pending athlete membership for an entitled user', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      isSystemAdmin: true,
      athleteProfile: null,
      clubsOwned: [],
      members_on: [],
    } as any)
    vi.mocked(prisma.club.findUnique).mockResolvedValue({
      id: '515560b4-367d-44a6-89bf-ba486e9e46a7',
      slug: 'test-club',
    } as any)
    vi.mocked(prisma.member.findUnique).mockResolvedValue(null)

    const response = await app.inject({
      method: 'POST',
      url: '/clubs/test-club/join',
      headers: { authorization: `Bearer ${app.jwt.sign({ sub: userId })}` },
      body: { token: 'invite-token' },
    })

    expect(response.statusCode).toBe(201)
    expect(prisma.member.create).toHaveBeenCalledWith({
      data: {
        userId,
        clubId: '515560b4-367d-44a6-89bf-ba486e9e46a7',
        role: 'ATHLETE',
        status: 'PENDING',
      },
    })
  })
})
