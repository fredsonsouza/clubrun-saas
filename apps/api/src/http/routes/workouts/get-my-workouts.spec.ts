import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    workout: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}))

describe('Get My Workouts (Unit)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be able to get their own workouts', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const clubId = '515560b4-367d-44a6-89bf-ba486e9e46a7'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.workout.count).mockResolvedValue(1)
    vi.mocked(prisma.workout.findMany).mockResolvedValue([
      {
        id: '81f02179-8d75-474c-8975-c54d8b965c4d',
        title: 'Morning Run',
        distance: 10,
        duration: 3600,
        pace: 6.0,
        date: new Date(),
        notes: null,
        type: 'EASY',
        status: 'COMPLETED',
        assignmentMode: null,
        clubId: clubId,
        club: { name: 'Acme Club', avatarUrl: null },
        createdAt: new Date(),
      },
    ] as any)

    const response = await app.inject({
      method: 'GET',
      url: '/workouts/me',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().workouts).toHaveLength(1)
    expect(response.json().meta.total).toBe(1)
  })
})
