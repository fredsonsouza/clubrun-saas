import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    member: { findFirst: vi.fn() },
    race: { findFirst: vi.fn() },
    raceParticipant: {
      findFirst: vi.fn(),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}))

describe('Explicit race registration contracts (Unit)', () => {
  const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
  const clubId = '515560b4-367d-44a6-89bf-ba486e9e46a7'
  const raceId = '81f02179-8d75-474c-8975-c54d8b965c4d'
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
    vi.mocked(prisma.race.findFirst).mockResolvedValue({
      id: raceId,
      clubId,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
    } as any)
    vi.mocked(prisma.raceParticipant.findFirst).mockResolvedValue(null)
  })

  it('converges repeated PUT requests on the registered state', async () => {
    const request = {
      method: 'PUT' as const,
      url: `/clubs/test-club/races/${raceId}/participants/me`,
      headers: { authorization: `Bearer ${token}` },
    }

    const firstResponse = await app.inject(request)
    const secondResponse = await app.inject(request)

    expect(firstResponse.statusCode).toBe(200)
    expect(secondResponse.statusCode).toBe(200)
    expect(prisma.raceParticipant.upsert).toHaveBeenCalledTimes(2)
    expect(prisma.raceParticipant.upsert).toHaveBeenLastCalledWith({
      where: { raceId_athleteId: { raceId, athleteId: userId } },
      create: { raceId, athleteId: userId },
      update: {},
    })
  })

  it('converges repeated DELETE requests on the unregistered state', async () => {
    const request = {
      method: 'DELETE' as const,
      url: `/clubs/test-club/races/${raceId}/participants/me`,
      headers: { authorization: `Bearer ${token}` },
    }

    const firstResponse = await app.inject(request)
    const secondResponse = await app.inject(request)

    expect(firstResponse.statusCode).toBe(204)
    expect(secondResponse.statusCode).toBe(204)
    expect(prisma.raceParticipant.deleteMany).toHaveBeenCalledTimes(2)
  })

  it('does not expose or mutate a race from another tenant', async () => {
    vi.mocked(prisma.race.findFirst).mockResolvedValue(null)

    const response = await app.inject({
      method: 'PUT',
      url: `/clubs/test-club/races/${raceId}/participants/me`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(404)
    expect(prisma.race.findFirst).toHaveBeenCalledWith({
      where: { id: raceId, clubId },
    })
    expect(prisma.raceParticipant.upsert).not.toHaveBeenCalled()
  })

  it('does not register the legacy toggle POST route', async () => {
    const response = await app.inject({
      method: 'POST',
      url: `/clubs/test-club/races/${raceId}/toggle-registration`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(404)
  })
})
