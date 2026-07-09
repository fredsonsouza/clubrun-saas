import { vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    member: {
      findFirst: vi.fn(),
    },
    workout: {
      findUnique: vi.fn(),
    },
    workoutReaction: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}))

import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

describe('Toggle Workout Reaction (Unit)', () => {
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
      role: 'ATHLETE',
      club: { id: clubId, slug: 'test-club' },
    } as any)

    vi.mocked(prisma.workout.findUnique).mockResolvedValue({
      id: workoutId,
      clubId,
      athleteId: 'another-user-id',
    } as any)
  })

  it('should be able to react with LIKE to a workout for the first time', async () => {
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.workoutReaction.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.workoutReaction.groupBy).mockResolvedValue([
      {
        type: 'LIKE',
        _count: { id: 1 },
      },
    ] as any)

    const response = await app.inject({
      method: 'POST',
      url: `/clubs/test-club/workouts/${workoutId}/reactions`,
      headers: {
        authorization: `Bearer ${token}`,
      },
      payload: {
        type: 'LIKE',
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({
      currentUserReaction: 'LIKE',
      reactions: [
        {
          type: 'LIKE',
          count: 1,
        },
      ],
    })
    expect(prisma.workoutReaction.create).toHaveBeenCalledWith({
      data: {
        workoutId,
        userId,
        type: 'LIKE',
      },
    })
  })

  it('should be able to remove a reaction if it is clicked again', async () => {
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.workoutReaction.findUnique).mockResolvedValue({
      id: 'reaction-id',
      type: 'LIKE',
      userId,
      workoutId,
    } as any)
    vi.mocked(prisma.workoutReaction.groupBy).mockResolvedValue([])

    const response = await app.inject({
      method: 'POST',
      url: `/clubs/test-club/workouts/${workoutId}/reactions`,
      headers: {
        authorization: `Bearer ${token}`,
      },
      payload: {
        type: 'LIKE',
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({
      currentUserReaction: null,
      reactions: [],
    })
    expect(prisma.workoutReaction.delete).toHaveBeenCalledWith({
      where: {
        id: 'reaction-id',
      },
    })
  })

  it('should be able to change reaction type if a different reaction is clicked', async () => {
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.workoutReaction.findUnique).mockResolvedValue({
      id: 'reaction-id',
      type: 'LIKE',
      userId,
      workoutId,
    } as any)
    vi.mocked(prisma.workoutReaction.groupBy).mockResolvedValue([
      {
        type: 'FIRE',
        _count: { id: 1 },
      },
    ] as any)

    const response = await app.inject({
      method: 'POST',
      url: `/clubs/test-club/workouts/${workoutId}/reactions`,
      headers: {
        authorization: `Bearer ${token}`,
      },
      payload: {
        type: 'FIRE',
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({
      currentUserReaction: 'FIRE',
      reactions: [
        {
          type: 'FIRE',
          count: 1,
        },
      ],
    })
    expect(prisma.workoutReaction.update).toHaveBeenCalledWith({
      where: {
        id: 'reaction-id',
      },
      data: {
        type: 'FIRE',
      },
    })
  })
})
