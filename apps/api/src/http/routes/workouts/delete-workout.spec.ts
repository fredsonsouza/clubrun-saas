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
      delete: vi.fn(),
    },
  },
}))

describe('Delete Workout (Unit)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be able to delete their own workout', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const workoutId = '81f02179-8d75-474c-8975-c54d8b965c4d'
    const clubId = '515560b4-367d-44a6-89bf-ba486e9e46a7'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'member-id',
      userId,
      role: 'MEMBER',
      club: { id: clubId, slug: 'acme-club' },
    } as any)

    vi.mocked(prisma.workout.findUnique).mockResolvedValue({
      id: workoutId,
      athleteId: userId,
      clubId,
      visibility: 'PUBLIC',
    } as any)

    const response = await app.inject({
      method: 'DELETE',
      url: `/clubs/acme-club/workouts/${workoutId}`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(204)
    expect(prisma.workout.delete).toHaveBeenCalledWith({
      where: { id: workoutId },
    })
  })

  it('should not be able to delete another user workout', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const workoutId = '81f02179-8d75-474c-8975-c54d8b965c4d'
    const clubId = '515560b4-367d-44a6-89bf-ba486e9e46a7'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'member-id',
      userId,
      role: 'MEMBER',
      club: { id: clubId, slug: 'acme-club' },
    } as any)

    vi.mocked(prisma.workout.findUnique).mockResolvedValue({
      id: workoutId,
      athleteId: 'other-user-id',
      clubId,
      visibility: 'PUBLIC',
    } as any)

    const response = await app.inject({
      method: 'DELETE',
      url: `/clubs/acme-club/workouts/${workoutId}`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(401)
  })
})
