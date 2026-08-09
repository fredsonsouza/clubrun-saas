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

describe('Request Join Club premium entitlement (Unit)', () => {
  const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'

  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 403 before creating a request for a non-premium athlete', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      isSystemAdmin: false,
      athleteProfile: { isPremium: false },
      clubsOwned: [],
      members_on: [],
    } as any)

    const response = await app.inject({
      method: 'POST',
      url: '/clubs/test-club/join-request',
      headers: { authorization: `Bearer ${app.jwt.sign({ sub: userId })}` },
    })

    expect(response.statusCode).toBe(403)
    expect(prisma.member.create).not.toHaveBeenCalled()
  })

  it('creates a pending athlete request with server-side premium entitlement', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      isSystemAdmin: false,
      athleteProfile: { isPremium: true },
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
      url: '/clubs/test-club/join-request',
      headers: { authorization: `Bearer ${app.jwt.sign({ sub: userId })}` },
    })

    expect(response.statusCode).toBe(201)
    expect(prisma.member.create).toHaveBeenCalledWith({
      data: {
        clubId: '515560b4-367d-44a6-89bf-ba486e9e46a7',
        userId,
        role: 'ATHLETE',
        status: 'PENDING',
      },
    })
  })
})
