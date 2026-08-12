import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    member: {
      findFirst: vi.fn(),
    },
    club: {
      findFirst: vi.fn(),
    },
  },
}))

describe('Get Club (Unit)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be able to get club details', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: '81f02179-8d75-474c-8975-c54d8b965c4d',
      userId,
      role: 'ATHLETE',
      club: {
        id: '515560b4-367d-44a6-89bf-ba486e9e46a7',
        name: 'Acme Club',
        slug: 'acme-club',
        domain: 'acme.com',
        cnpj: null,
        shouldAttachUsersByDomain: true,
        avatarUrl: 'http://example.com/avatar.jpg',
        bannerUrl: null,
        description: 'Mock Description',
        city: 'Mock City',
        state: 'Mock State',
        status: 'ACTIVE',
        subscriptionStatus: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: userId,
      },
      user: {
        isSystemAdmin: false,
      },
    } as any)

    const response = await app.inject({
      method: 'GET',
      url: '/clubs/acme-club',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({
      club: expect.objectContaining({
        id: '515560b4-367d-44a6-89bf-ba486e9e46a7',
        name: 'Acme Club',
        slug: 'acme-club',
      }),
      membership: {
        role: 'ATHLETE',
      },
    })
  })

  it('should return 403 if user is not an active member of the club', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.club.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      isSystemAdmin: false,
    } as any)

    const response = await app.inject({
      method: 'GET',
      url: '/clubs/not-member-club',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(403)
  })
})
