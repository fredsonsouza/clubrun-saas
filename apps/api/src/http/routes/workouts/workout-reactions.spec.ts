import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    member: { findFirst: vi.fn() },
    workout: { findFirst: vi.fn() },
    workoutReaction: {
      upsert: vi.fn(),
      deleteMany: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}))

describe('Explicit workout reaction contracts (Unit)', () => {
  const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
  const clubId = '515560b4-367d-44a6-89bf-ba486e9e46a7'
  const workoutId = '81f02179-8d75-474c-8975-c54d8b965c4d'
  let token: string

  beforeAll(async () => {
    await app.ready()
    token = app.jwt.sign({ sub: userId })
  })

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: '9bbf5efc-1b77-4a37-b956-2580556ea78d',
      userId,
      role: 'ATHLETE',
      status: 'ACTIVE',
      club: { id: clubId, slug: 'test-club', status: 'ACTIVE' },
      user: { isSystemAdmin: false },
    } as any)
    vi.mocked(prisma.workout.findFirst).mockResolvedValue({
      athleteId: 'another-user-id',
      visibility: 'PUBLIC',
    } as any)
    vi.mocked(prisma.workoutReaction.groupBy).mockResolvedValue([
      { type: 'LIKE', _count: { id: 1 } },
    ] as any)
  })

  it('converges repeated PUT requests on the requested reaction', async () => {
    const request = {
      method: 'PUT' as const,
      url: `/clubs/test-club/workouts/${workoutId}/reactions/me`,
      headers: { authorization: `Bearer ${token}` },
      body: { type: 'LIKE' },
    }

    const firstResponse = await app.inject(request)
    const secondResponse = await app.inject(request)

    expect(firstResponse.statusCode).toBe(200)
    expect(secondResponse.statusCode).toBe(200)
    expect(prisma.workoutReaction.upsert).toHaveBeenCalledTimes(2)
    expect(prisma.workoutReaction.upsert).toHaveBeenLastCalledWith({
      where: { workoutId_userId: { workoutId, userId } },
      create: { workoutId, userId, type: 'LIKE' },
      update: { type: 'LIKE' },
    })
  })

  it('converges repeated DELETE requests on the no-reaction state', async () => {
    vi.mocked(prisma.workoutReaction.groupBy).mockResolvedValue([])
    const request = {
      method: 'DELETE' as const,
      url: `/clubs/test-club/workouts/${workoutId}/reactions/me`,
      headers: { authorization: `Bearer ${token}` },
    }

    const firstResponse = await app.inject(request)
    const secondResponse = await app.inject(request)

    expect(firstResponse.statusCode).toBe(200)
    expect(secondResponse.statusCode).toBe(200)
    expect(firstResponse.json().currentUserReaction).toBeNull()
    expect(prisma.workoutReaction.deleteMany).toHaveBeenCalledTimes(2)
  })

  it('does not expose or mutate a workout from another tenant', async () => {
    vi.mocked(prisma.workout.findFirst).mockResolvedValue(null)

    const response = await app.inject({
      method: 'PUT',
      url: `/clubs/test-club/workouts/${workoutId}/reactions/me`,
      headers: { authorization: `Bearer ${token}` },
      body: { type: 'FIRE' },
    })

    expect(response.statusCode).toBe(404)
    expect(prisma.workout.findFirst).toHaveBeenCalledWith({
      where: { id: workoutId, clubId },
      select: { athleteId: true, visibility: true },
    })
    expect(prisma.workoutReaction.upsert).not.toHaveBeenCalled()
  })

  it('denies reactions to another athlete private workout', async () => {
    vi.mocked(prisma.workout.findFirst).mockResolvedValue({
      athleteId: 'another-user-id',
      visibility: 'PRIVATE',
    } as any)

    const response = await app.inject({
      method: 'PUT',
      url: `/clubs/test-club/workouts/${workoutId}/reactions/me`,
      headers: { authorization: `Bearer ${token}` },
      body: { type: 'CLAP' },
    })

    expect(response.statusCode).toBe(403)
    expect(prisma.workoutReaction.upsert).not.toHaveBeenCalled()
  })

  it('does not register the legacy reaction POST route', async () => {
    const response = await app.inject({
      method: 'POST',
      url: `/clubs/test-club/workouts/${workoutId}/reactions`,
      headers: { authorization: `Bearer ${token}` },
      body: { type: 'LIKE' },
    })

    expect(response.statusCode).toBe(404)
  })
})
