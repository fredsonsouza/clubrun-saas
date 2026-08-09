import { vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    member: {
      findFirst: vi.fn(),
    },
    raceParticipant: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}))

import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

describe('Update Race Payment Status (Unit)', () => {
  const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
  const clubId = '515560b4-367d-44a6-89bf-ba486e9e46a7'
  const raceId = '81f02179-8d75-474c-8975-c54d8b965c4d'
  const athleteId = '90f9689b-9c5c-4d8b-96d5-4d8b965c4d8b'

  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'admin-member-id',
      userId,
      role: 'ADMIN',
      status: 'ACTIVE',
      clubId,
      club: { id: clubId, slug: 'acme-club', ownerId: 'owner-id' },
      user: { isSystemAdmin: false },
    } as any)
  })

  it('should update a participant scoped to a race in the current club', async () => {
    const token = app.jwt.sign({ sub: userId })
    const participantId = '3781311b-77c7-4b95-8150-fcb6830f89f1'

    vi.mocked(prisma.raceParticipant.findFirst).mockResolvedValue({
      id: participantId,
      raceId,
      athleteId,
    } as any)

    const response = await app.inject({
      method: 'PATCH',
      url: `/clubs/acme-club/races/${raceId}/participants/${athleteId}/payment`,
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        paymentStatus: 'CONFIRMED',
      },
    })

    expect(response.statusCode).toBe(200)
    expect(prisma.raceParticipant.findFirst).toHaveBeenCalledWith({
      where: {
        raceId,
        athleteId,
        race: { clubId },
      },
    })
    expect(prisma.raceParticipant.update).toHaveBeenCalledWith({
      where: { id: participantId, raceId },
      data: { paymentStatus: 'CONFIRMED' },
    })
  })

  it('should reject a participant that is not in the current club race', async () => {
    const token = app.jwt.sign({ sub: userId })
    vi.mocked(prisma.raceParticipant.findFirst).mockResolvedValue(null)

    const response = await app.inject({
      method: 'PATCH',
      url: `/clubs/acme-club/races/${raceId}/participants/${athleteId}/payment`,
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        paymentStatus: 'CONFIRMED',
      },
    })

    expect(response.statusCode).toBe(404)
    expect(prisma.raceParticipant.update).not.toHaveBeenCalled()
  })
})
