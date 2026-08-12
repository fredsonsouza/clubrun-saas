import { vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    workout: {
      aggregate: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

describe('Get User Profile (Unit)', () => {
  const viewerId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
  const profileUserId = '515560b4-367d-44a6-89bf-ba486e9e46a7'

  const publicUser = {
    id: profileUserId,
    name: 'Public Athlete',
    email: 'athlete@example.com',
    avatarUrl: null,
    isSystemAdmin: false,
    clubsOwned: [],
    members_on: [],
    athleteProfile: {
      isPublic: true,
      bio: 'Runner',
      city: 'Recife',
      paceAvg: 5.5,
      weight: 70,
      height: 175,
      gender: 'OTHER',
      birthDate: new Date('1990-01-01T00:00:00.000Z'),
      instagramUrl: null,
      stravaUrl: null,
      coverUrl: null,
      shoes: 'Private shoes',
      shoesMaxDistance: 500,
      shoesRemainingDistance: 300,
      watch: 'Private watch',
      hasMedicalConditions: true,
      medicalConditions: 'Private medical data',
      stravaAthleteId: 'strava-id',
      isPremium: false,
    },
  }

  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prisma.workout.aggregate).mockResolvedValue({
      _sum: { distance: 10, duration: 3600 },
      _count: { id: 1 },
    } as any)
    vi.mocked(prisma.workout.findMany).mockResolvedValue([])
  })

  it('should expose only public profile data and public workout statistics', async () => {
    const token = app.jwt.sign({ sub: viewerId })
    vi.mocked(prisma.user.findUnique).mockResolvedValue(publicUser as any)

    const response = await app.inject({
      method: 'GET',
      url: `/users/${profileUserId}/profile`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().user).not.toHaveProperty('email')
    expect(response.json().user.isSystemAdmin).toBeUndefined()
    expect(response.json().athleteProfile).not.toHaveProperty('gender')
    expect(response.json().athleteProfile).not.toHaveProperty('birthDate')
    expect(response.json().athleteProfile).not.toHaveProperty('weight')
    expect(response.json().athleteProfile).not.toHaveProperty(
      'medicalConditions'
    )
    expect(response.json().athleteProfile).not.toHaveProperty(
      'hasMedicalConditions'
    )
    expect(response.json().plannedWorkouts).toEqual([])
    expect(prisma.workout.aggregate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          athleteId: profileUserId,
          visibility: 'PUBLIC',
        }),
      })
    )
    expect(prisma.workout.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          athleteId: profileUserId,
          status: 'COMPLETED',
          visibility: 'PUBLIC',
        },
      })
    )
  })

  it('should reject access to a private profile', async () => {
    const token = app.jwt.sign({ sub: viewerId })
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      ...publicUser,
      athleteProfile: {
        ...publicUser.athleteProfile,
        isPublic: false,
      },
    } as any)

    const response = await app.inject({
      method: 'GET',
      url: `/users/${profileUserId}/profile`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(404)
    expect(prisma.workout.aggregate).not.toHaveBeenCalled()
    expect(prisma.workout.findMany).not.toHaveBeenCalled()
  })
})
