import { vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    member: {
      findFirst: vi.fn(),
    },
    workout: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}))

import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

describe('Get Workouts (Unit)', () => {
  const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
  const clubId = '515560b4-367d-44a6-89bf-ba486e9e46a7'

  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: '9bbf5efc-1b77-4a37-b956-2580556ea78d',
      userId,
      role: 'ADMIN',
      club: { id: clubId, slug: 'test-club' },
    } as any)
    vi.mocked(prisma.workout.count).mockResolvedValue(1)
  })

  it('should be able to list club workouts', async () => {
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.workout.findMany).mockResolvedValue([
      {
        id: '81f02179-8d75-474c-8975-c54d8b965c4d',
        title: 'Run',
        slug: 'run',
        distance: 5,
        duration: 1800,
        pace: 6.0,
        type: 'EASY',
        status: 'COMPLETED',
        assignmentMode: null,
        date: new Date(),
        notes: null,
        imageUrl: null,
        createdAt: new Date(),
        clubId: clubId,
        visibility: 'PUBLIC',
        athlete: {
          id: userId,
          name: 'John Doe',
          avatarUrl: null,
        },
        club: {
          name: 'Test Club',
          slug: 'test-club',
          avatarUrl: null,
        },
      },
    ] as any)

    const response = await app.inject({
      method: 'GET',
      url: '/clubs/test-club/workouts',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().workouts).toHaveLength(1)
    expect(response.json().meta.total).toBe(1)
  })
})
