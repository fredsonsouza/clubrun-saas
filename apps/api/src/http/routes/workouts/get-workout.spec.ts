import { vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    member: {
      findFirst: vi.fn(),
    },
    workout: {
      findFirst: vi.fn(),
    },
  },
}))

import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

describe('Get Workout (Unit)', () => {
  const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
  const clubId = '515560b4-367d-44a6-89bf-ba486e9e46a7'
  const workoutId = '81f02179-8d75-474c-8975-c54d8b965c4d'

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
  })

  it('should be able to get workout details', async () => {
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.workout.findFirst).mockResolvedValue({
      id: workoutId,
      title: 'Morning Run',
      slug: 'morning-run',
      distance: 10,
      duration: 3600,
      pace: 6,
      type: 'EASY',
      status: 'COMPLETED',
      assignmentMode: null,
      date: new Date(),
      notes: null,
      imageUrl: null,
      clubId: clubId,
      visibility: 'PUBLIC',
      createdAt: new Date(),
      athlete: {
        id: userId,
        name: 'John Doe',
        avatarUrl: null,
      },
    } as any)

    const response = await app.inject({
      method: 'GET',
      url: '/clubs/test-club/workouts/morning-run',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().workout.title).toBe('Morning Run')
    expect(response.json().workout.visibility).toBe('PUBLIC')
    expect(prisma.workout.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          clubId,
          OR: [
            { athleteId: userId },
            { visibility: 'PUBLIC' },
            { visibility: 'COACH_ONLY' },
          ],
        }),
      })
    )
  })

  it('should return 400 if workout is not found', async () => {
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.workout.findFirst).mockResolvedValue(null)

    const response = await app.inject({
      method: 'GET',
      url: '/clubs/test-club/workouts/non-existent-workout',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().message).toBe('Workout not found!')
  })
})
