import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    athleteProfile: {
      update: vi.fn(),
    },
  },
}))

describe('Update Athlete Profile (Unit)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be able to update athlete profile', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: userId })

    const updateData = {
      weight: 75,
      height: 180,
      bio: 'New bio content',
      isPublic: true,
    }

    vi.mocked(prisma.athleteProfile.update).mockResolvedValue({
      userId,
      ...updateData,
    } as any)

    const response = await app.inject({
      method: 'PUT',
      url: '/profile/athlete',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: updateData,
    })

    expect(response.statusCode).toBe(200)
    expect(prisma.athleteProfile.update).toHaveBeenCalledWith({
      where: { userId },
      data: updateData,
    })
  })

  it('should not be able to update athlete profile with invalid data', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: userId })

    const response = await app.inject({
      method: 'PUT',
      url: '/profile/athlete',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        weight: -10, // Inválido
      },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().message).toBe('Validation error')
  })
})
