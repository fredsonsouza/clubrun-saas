import { vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(async (callback) => callback(prisma)),
    member: {
      findFirst: vi.fn(),
    },
    workout: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      updateMany: vi.fn(),
      aggregate: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
    },
    athleteProfile: {
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      upsert: vi.fn(),
    },
  },
}))

vi.mock('@/services/update-athlete-ranking', () => ({
  updateAthleteRanking: vi.fn(),
  updateAthletePaceAverage: vi.fn(),
}))

import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { updateAthleteRanking } from '@/services/update-athlete-ranking'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

describe('Complete Workout (Unit)', () => {
  const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
  const clubId = '515560b4-367d-44a6-89bf-ba486e9e46a7'
  const workoutId = '81f02179-8d75-474c-8975-c54d8b965c4d'

  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'member-id',
      userId,
      role: 'ATHLETE',
      status: 'ACTIVE',
      clubId,
      club: { id: clubId, slug: 'acme-club', ownerId: 'owner-id' },
      user: { isSystemAdmin: false },
    } as any)
    vi.mocked(prisma.athleteProfile.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.workout.updateMany).mockResolvedValue({ count: 1 })
    vi.mocked(prisma.workout.aggregate).mockResolvedValue({
      _sum: { distance: null, duration: null },
    } as any)
  })

  it('should complete only an own workout from the current club', async () => {
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.workout.findFirst).mockResolvedValue({
      id: workoutId,
      clubId,
      athleteId: userId,
      status: 'PLANNED',
      distance: 10,
      duration: null,
      notes: null,
      targetDistance: 10,
      targetDuration: null,
    } as any)

    const response = await app.inject({
      method: 'PATCH',
      url: `/clubs/acme-club/workouts/${workoutId}/complete`,
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        duration: 3600,
      },
    })

    expect(response.statusCode).toBe(204)
    expect(prisma.workout.findFirst).toHaveBeenCalledWith({
      where: { id: workoutId, clubId },
    })
    expect(prisma.workout.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: workoutId,
          clubId,
          athleteId: userId,
          status: 'PLANNED',
        },
        data: expect.objectContaining({ status: 'COMPLETED' }),
      })
    )
  })

  it('should not apply effects when another request already completed the workout', async () => {
    const token = app.jwt.sign({ sub: userId })
    vi.mocked(prisma.workout.findFirst).mockResolvedValue({
      id: workoutId,
      clubId,
      athleteId: userId,
      status: 'PLANNED',
      distance: 10,
      duration: null,
      notes: null,
      targetDistance: 10,
      targetDuration: null,
    } as any)
    vi.mocked(prisma.workout.updateMany).mockResolvedValue({ count: 0 })

    const response = await app.inject({
      method: 'PATCH',
      url: `/clubs/acme-club/workouts/${workoutId}/complete`,
      headers: { authorization: `Bearer ${token}` },
      body: { duration: 3600 },
    })

    expect(response.statusCode).toBe(400)
    expect(prisma.athleteProfile.update).not.toHaveBeenCalled()
    expect(updateAthleteRanking).not.toHaveBeenCalled()
    expect(prisma.workout.aggregate).not.toHaveBeenCalled()
  })

  it('should not complete a workout from another club', async () => {
    const token = app.jwt.sign({ sub: userId })
    vi.mocked(prisma.workout.findFirst).mockResolvedValue(null)

    const response = await app.inject({
      method: 'PATCH',
      url: `/clubs/acme-club/workouts/${workoutId}/complete`,
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        duration: 3600,
      },
    })

    expect(response.statusCode).toBe(404)
    expect(prisma.workout.findFirst).toHaveBeenCalledWith({
      where: { id: workoutId, clubId },
    })
    expect(prisma.workout.updateMany).not.toHaveBeenCalled()
  })
})
