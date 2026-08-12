import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(async (callback) => callback(prisma)),
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    athleteProfile: {
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      upsert: vi.fn(),
    },
    shoesMileageEntry: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
    },
    member: {
      findFirst: vi.fn(),
    },
    workout: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      aggregate: vi.fn(),
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
    idempotencyRecord: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      updateMany: vi.fn(),
    },
    race: {
      findFirst: vi.fn(),
    },
    raceParticipant: {
      findUnique: vi.fn(),
    },
    raceResult: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}))

vi.mock('@/services/update-athlete-ranking', () => ({
  updateAthleteRanking: vi.fn(),
  updateAthletePaceAverage: vi.fn(),
}))

describe('Shoes Lifespan & Mileage Tracking (Unit)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Profile Updates', () => {
    it('should throw error if premium user sets shoes without max distance', async () => {
      const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
      const token = app.jwt.sign({ sub: userId })

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: userId,
        name: 'Athlete',
        isSystemAdmin: false,
        clubsOwned: [],
        members_on: [],
        athleteProfile: {
          isPremium: true,
          shoes: null,
          shoesMaxDistance: null,
          shoesRemainingDistance: null,
        },
      } as any)

      const response = await app.inject({
        method: 'PUT',
        url: '/profile/athlete',
        headers: { authorization: `Bearer ${token}` },
        body: {
          shoes: 'Nike Pegasus',
          shoesMaxDistance: null,
          birthDate: '1995-05-15T00:00:00.000Z',
        },
      })

      expect(response.statusCode).toBe(400)
      expect(response.json().message).toContain(
        'Ao informar um tênis, você deve passar uma quilometragem de uso recomendada'
      )
    })

    it('should initialize shoesRemainingDistance to shoesMaxDistance for a new shoe', async () => {
      const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
      const token = app.jwt.sign({ sub: userId })

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: userId,
        name: 'Athlete',
        isSystemAdmin: false,
        clubsOwned: [],
        members_on: [],
        athleteProfile: {
          isPremium: true,
          shoes: null,
          shoesMaxDistance: null,
          shoesRemainingDistance: null,
        },
      } as any)

      vi.mocked(prisma.athleteProfile.update).mockResolvedValue({} as any)

      const response = await app.inject({
        method: 'PUT',
        url: '/profile/athlete',
        headers: { authorization: `Bearer ${token}` },
        body: {
          shoes: 'Nike Pegasus',
          shoesMaxDistance: 500,
          birthDate: '1995-05-15T00:00:00.000Z',
        },
      })

      expect(response.statusCode).toBe(200)
      expect(prisma.athleteProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            shoes: 'Nike Pegasus',
            shoesMaxDistance: 500,
            shoesRemainingDistance: 500,
          }),
        })
      )
    })

    it('should adjust shoesRemainingDistance when updating shoesMaxDistance for the same shoe', async () => {
      const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
      const token = app.jwt.sign({ sub: userId })

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: userId,
        name: 'Athlete',
        isSystemAdmin: false,
        clubsOwned: [],
        members_on: [],
        athleteProfile: {
          isPremium: true,
          shoes: 'Nike Pegasus',
          shoesMaxDistance: 500,
          shoesRemainingDistance: 450, // has run 50km
        },
      } as any)

      vi.mocked(prisma.athleteProfile.update).mockResolvedValue({} as any)

      const response = await app.inject({
        method: 'PUT',
        url: '/profile/athlete',
        headers: { authorization: `Bearer ${token}` },
        body: {
          shoes: 'Nike Pegasus',
          shoesMaxDistance: 600, // increased by 100km
          birthDate: '1995-05-15T00:00:00.000Z',
        },
      })

      expect(response.statusCode).toBe(200)
      expect(prisma.athleteProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            shoes: 'Nike Pegasus',
            shoesMaxDistance: 600,
            shoesRemainingDistance: 550, // 450 + 100
          }),
        })
      )
    })
  })

  describe('Workouts Integration', () => {
    it('should block completed workout creation if distance exceeds remaining shoes lifespan', async () => {
      const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
      const token = app.jwt.sign({ sub: userId })

      vi.mocked(prisma.member.findFirst).mockResolvedValue({
        id: 'member-id',
        userId,
        role: 'ATHLETE',
        club: { id: 'club-id', slug: 'acme-club' },
        user: { isSystemAdmin: false },
      } as any)

      vi.mocked(prisma.athleteProfile.findUnique).mockResolvedValue({
        shoes: 'Nike Pegasus',
        shoesRemainingDistance: 10,
      } as any)

      const response = await app.inject({
        method: 'POST',
        url: '/clubs/acme-club/workouts',
        headers: {
          authorization: `Bearer ${token}`,
          'idempotency-key': 'unit-shoes-create-1',
        },
        body: {
          title: 'Long Run',
          distance: 15, // 15 > 10
          type: 'LONG',
          status: 'COMPLETED',
          date: new Date().toISOString(),
        },
      })

      expect(response.statusCode).toBe(400)
      expect(response.json().message).toContain(
        'O treino excede a vida útil restante do seu tênis'
      )
    })

    it('should decrement shoesRemainingDistance on completed workout creation', async () => {
      const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
      const token = app.jwt.sign({ sub: userId })

      vi.mocked(prisma.member.findFirst).mockResolvedValue({
        id: 'member-id',
        userId,
        role: 'ATHLETE',
        club: { id: 'club-id', slug: 'acme-club' },
        user: { isSystemAdmin: false },
      } as any)

      vi.mocked(prisma.athleteProfile.findUnique).mockResolvedValue({
        shoes: 'Nike Pegasus',
        shoesRemainingDistance: 100,
      } as any)

      vi.mocked(prisma.workout.create).mockResolvedValue({
        id: '81f02179-8d75-474c-8975-c54d8b965c4d',
        status: 'COMPLETED',
        distance: 10,
      } as any)

      vi.mocked(prisma.workout.aggregate).mockResolvedValue({
        _sum: { distance: 10, duration: 3600 },
      } as any)

      const response = await app.inject({
        method: 'POST',
        url: '/clubs/acme-club/workouts',
        headers: {
          authorization: `Bearer ${token}`,
          'idempotency-key': 'unit-shoes-create-2',
        },
        body: {
          title: 'Run',
          distance: 10,
          type: 'EASY',
          status: 'COMPLETED',
          date: new Date().toISOString(),
        },
      })

      expect(response.statusCode).toBe(201)
      expect(prisma.athleteProfile.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId, shoesRemainingDistance: { gte: 10 } },
          data: {
            shoesRemainingDistance: {
              decrement: 10,
            },
          },
        })
      )
    })
  })
})
