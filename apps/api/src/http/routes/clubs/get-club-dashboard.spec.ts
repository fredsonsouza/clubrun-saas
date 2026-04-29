import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    member: {
      findFirst: vi.fn(),
      count: vi.fn(),
    },
    invite: {
      count: vi.fn(),
    },
    workout: {
      aggregate: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}))

describe('Get Club Dashboard (Unit)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be able to get club dashboard metrics', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: '81f02179-8d75-474c-8975-c54d8b965c4d',
      userId,
      role: 'ADMIN',
      club: { id: '515560b4-367d-44a6-89bf-ba486e9e46a7', slug: 'acme-club' },
    } as any)

    vi.mocked(prisma.member.count)
      .mockResolvedValueOnce(10) // active
      .mockResolvedValueOnce(2)  // inactive
    
    vi.mocked(prisma.invite.count).mockResolvedValue(3)
    
    vi.mocked(prisma.workout.aggregate).mockResolvedValue({
      _sum: { distance: 150.5 },
      _count: { id: 25 },
    } as any)

    vi.mocked(prisma.workout.groupBy).mockResolvedValue([
      { type: 'EASY', _count: { id: 15 } },
      { type: 'INTERVAL', _count: { id: 10 } },
    ] as any)

    const response = await app.inject({
      method: 'GET',
      url: '/clubs/acme-club/dashboard',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({
      metrics: {
        activeMembers: 10,
        inactiveMembers: 2,
        pendingInvites: 3,
        totalDistanceMonth: 150.5,
        totalWorkoutsMonth: 25,
        workoutsByType: [
          { type: 'EASY', count: 15 },
          { type: 'INTERVAL', count: 10 },
        ],
      },
    })
  })
})
