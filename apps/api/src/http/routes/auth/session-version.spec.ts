import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    athleteProfile: { update: vi.fn() },
  },
}))

describe('JWT session version and verification guard', () => {
  beforeAll(() => app.ready())
  beforeEach(() => vi.clearAllMocks())

  it('rejects a JWT after sessionVersion is incremented', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      sessionVersion: 2,
      emailVerifiedAt: new Date(),
    } as any)
    const token = app.jwt.sign({ sub: 'user-id', sv: 1 })

    const response = await app.inject({
      method: 'GET',
      url: '/profile',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(401)
  })

  it('blocks unverified users by default', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      sessionVersion: 0,
      emailVerifiedAt: null,
    } as any)
    const token = app.jwt.sign({ sub: 'user-id', sv: 0 })

    const response = await app.inject({
      method: 'POST',
      url: '/profile/athlete/subscribe',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(403)
    expect(prisma.athleteProfile.update).not.toHaveBeenCalled()
  })

  it('allows an unverified user to read their profile', async () => {
    vi.mocked(prisma.user.findUnique)
      .mockResolvedValueOnce({
        sessionVersion: 0,
        emailVerifiedAt: null,
      } as any)
      .mockResolvedValueOnce({
        id: '4f88e178-57d5-4537-8e68-c1d00c4c4af5',
        name: 'Runner',
        email: 'runner@example.com',
        avatarUrl: null,
        isSystemAdmin: false,
        emailVerifiedAt: null,
        passwordHash: 'hash',
        clubsOwned: [],
        members_on: [],
        athleteProfile: { isPremium: false },
      } as any)
    const token = app.jwt.sign({
      sub: '4f88e178-57d5-4537-8e68-c1d00c4c4af5',
      sv: 0,
    })

    const response = await app.inject({
      method: 'GET',
      url: '/profile',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(200)
  })
})
