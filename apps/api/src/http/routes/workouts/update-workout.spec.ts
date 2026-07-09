import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    member: {
      findFirst: vi.fn(),
    },
    workout: {
      findUnique: vi.fn(),
      update: vi.fn(),
      aggregate: vi.fn(),
    },
    athleteProfile: {
      upsert: vi.fn(),
    },
  },
}))

describe('Update Workout (Unit)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be able to update their own workout', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const workoutId = '81f02179-8d75-474c-8975-c54d8b965c4d'
    const clubId = '515560b4-367d-44a6-89bf-ba486e9e46a7'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'member-id',
      userId,
      role: 'ATHLETE',
      club: { id: clubId, slug: 'acme-club' },
    } as any)

    vi.mocked(prisma.workout.findUnique).mockResolvedValue({
      id: workoutId,
      athleteId: userId,
      clubId,
      title: 'Old Title',
      distance: 5,
      type: 'EASY',
      visibility: 'PUBLIC',
    } as any)

    vi.mocked(prisma.workout.aggregate).mockResolvedValue({
      _sum: {
        distance: 10,
        duration: 3600,
      },
    } as any)

    const response = await app.inject({
      method: 'PUT',
      url: `/clubs/acme-club/workouts/${workoutId}`,
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        title: 'New Title',
        distance: 10,
        duration: 3600,
        pace: 6,
        type: 'TEMPO',
      },
    })

    expect(response.statusCode).toBe(204)
    expect(prisma.workout.update).toHaveBeenCalledWith({
      where: { id: workoutId },
      data: expect.objectContaining({ title: 'New Title' }),
    })
  })

  it('should not be able to update another user workout if not admin', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const workoutId = '81f02179-8d75-474c-8975-c54d8b965c4d'
    const clubId = '515560b4-367d-44a6-89bf-ba486e9e46a7'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'member-id',
      userId,
      role: 'ATHLETE',
      club: { id: clubId, slug: 'acme-club' },
    } as any)

    vi.mocked(prisma.workout.findUnique).mockResolvedValue({
      id: workoutId,
      athleteId: 'other-user-id',
      clubId,
      title: 'Other Workout',
      visibility: 'PUBLIC',
    } as any)

    const response = await app.inject({
      method: 'PUT',
      url: `/clubs/acme-club/workouts/${workoutId}`,
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        title: 'Try Hack',
        distance: 10,
        type: 'EASY',
        duration: null,
        pace: null,
      },
    })

    console.log(response.json())
    expect(response.statusCode).toBe(401)
  })
})
