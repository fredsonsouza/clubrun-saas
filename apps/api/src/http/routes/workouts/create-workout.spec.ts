import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    athleteProfile: {
      findUnique: vi.fn().mockResolvedValue(null),
    },
    member: {
      findFirst: vi.fn(),
    },
    club: {
      findFirst: vi.fn(),
    },
    workout: {
      create: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
    },
    ranking: {
      findFirst: vi.fn().mockResolvedValue(null),
      update: vi.fn(),
      create: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}))

vi.mock('@/services/update-athlete-ranking', () => ({
  updateAthleteRanking: vi.fn(),
}))

describe('Create Workout (Unit)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be able to create a new workout', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'member-id',
      userId,
      role: 'ATHLETE',
      club: { id: '515560b4-367d-44a6-89bf-ba486e9e46a7', slug: 'acme-club' },
      user: { isSystemAdmin: false },
    } as any)

    vi.mocked(prisma.workout.create).mockResolvedValue({
      id: '81f02179-8d75-474c-8975-c54d8b965c4d',
    } as any)

    const response = await app.inject({
      method: 'POST',
      url: '/clubs/acme-club/workouts',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        title: 'Morning Run',
        distance: 10.5,
        duration: 3600,
        pace: 5.4,
        type: 'EASY',
        date: new Date().toISOString(),
        notes: 'Feeling good',
        visibility: 'PRIVATE',
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toEqual({
      workoutId: '81f02179-8d75-474c-8975-c54d8b965c4d',
    })
    expect(prisma.workout.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'Morning Run',
          athleteId: userId,
          visibility: 'PRIVATE',
        }),
      })
    )
  })

  it('should be able to prescribe a workout to another athlete as COACH', async () => {
    const coachUserId = '515560b4-367d-44a6-89bf-ba486e9e46a7'
    const athleteUserId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: coachUserId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'coach-member-id',
      userId: coachUserId,
      role: 'COACH',
      club: { id: 'club-id', slug: 'acme-club' },
      user: { isSystemAdmin: false },
    } as any)

    vi.mocked(prisma.workout.create).mockResolvedValue({
      id: '81f02179-8d75-474c-8975-c54d8b965c4d',
    } as any)

    const response = await app.inject({
      method: 'POST',
      url: '/clubs/acme-club/workouts',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        title: 'Training Plan',
        distance: 5,
        duration: 1800,
        pace: 6.0,
        type: 'INTERVAL',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        athleteId: athleteUserId,
      },
    })

    expect(response.statusCode).toBe(201)
    expect(prisma.workout.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          athleteId: athleteUserId,
        }),
      })
    )
  })

  it('should not be able to create a workout if not a member', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.club.findFirst).mockResolvedValue({
      id: '515560b4-367d-44a6-89bf-ba486e9e46a7',
      slug: 'not-member-club',
    } as any)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      isSystemAdmin: false,
    } as any)

    const response = await app.inject({
      method: 'POST',
      url: '/clubs/not-member-club/workouts',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        title: 'Morning Run',
        distance: 10.5,
        duration: 3600,
        pace: 5.4,
        type: 'EASY',
        date: new Date().toISOString(),
      },
    })

    expect(response.statusCode).toBe(401)
  })
})
