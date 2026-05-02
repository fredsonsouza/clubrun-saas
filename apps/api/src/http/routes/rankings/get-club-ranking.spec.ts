import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    member: {
      findFirst: vi.fn(),
    },
    ranking: {
      findMany: vi.fn(),
    },
    workout: {
      aggregate: vi.fn(),
    },
  },
}))

describe('Get Club Ranking (Unit)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be able to get monthly ranking', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'member-id',
      userId,
      role: 'ATHLETE',
      user: { isSystemAdmin: false },
      club: { id: '515560b4-367d-44a6-89bf-ba486e9e46a7', slug: 'acme-club' },
    } as any)

    vi.mocked(prisma.ranking.findMany).mockResolvedValue([
      {
        id: 'ranking-1',
        points: 100,
        athlete: {
          id: 'athlete-1',
          name: 'Athlete One',
          avatarUrl: null,
        },
      },
    ] as any)

    vi.mocked(prisma.workout.aggregate).mockResolvedValue({
      _sum: { distance: 50 },
      _count: { id: 5 },
    } as any)

    const response = await app.inject({
      method: 'GET',
      url: '/clubs/acme-club/rankings',
      query: {
        type: 'monthly',
        year: '2024',
        month: '5',
      },
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().rankings).toHaveLength(1)
    expect(response.json().rankings[0]).toMatchObject({
      distance: 50,
      workoutsCount: 5
    })
  })

  it('should be able to get weekly ranking', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'member-id',
      userId,
      role: 'ATHLETE',
      user: { isSystemAdmin: false },
      club: { id: '515560b4-367d-44a6-89bf-ba486e9e46a7', slug: 'acme-club' },
    } as any)

    vi.mocked(prisma.ranking.findMany).mockResolvedValue([])
    vi.mocked(prisma.workout.aggregate).mockResolvedValue({ _sum: {}, _count: {} } as any)

    await app.inject({
      method: 'GET',
      url: '/clubs/acme-club/rankings',
      query: {
        type: 'weekly',
        year: '2024',
        week: '20',
      },
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(prisma.ranking.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          week: 20,
        }),
      })
    )
  })
})
