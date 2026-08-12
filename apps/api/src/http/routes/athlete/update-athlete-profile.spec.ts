import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
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

  it('should be able to update athlete profile if user is premium', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: userId })

    const updatePayload = {
      weight: 75,
      height: 180,
      bio: 'New bio content',
      isPublic: true,
      birthDate: '1995-05-15T00:00:00.000Z',
    }

    // Mock do usuário sendo premium
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: userId,
      name: 'Old Name',
      isSystemAdmin: false,
      clubsOwned: [],
      members_on: [],
      athleteProfile: {
        isPremium: true,
        bio: 'Old bio',
        gender: null,
        weight: 70,
        height: 175,
        instagramUrl: null,
        youtubeUrl: null,
        stravaUrl: null,
        coverUrl: null,
        isPublic: true,
        shoes: null,
        watch: null,
        hasMedicalConditions: false,
        medicalConditions: null,
      },
    } as any)

    vi.mocked(prisma.athleteProfile.update).mockResolvedValue({
      userId,
      ...updatePayload,
      birthDate: new Date(updatePayload.birthDate),
    } as any)

    const response = await app.inject({
      method: 'PUT',
      url: '/profile/athlete',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: updatePayload,
    })

    expect(response.statusCode).toBe(200)
    expect(prisma.athleteProfile.update).toHaveBeenCalledWith({
      where: { userId },
      select: expect.any(Object),
      data: {
        weight: 75,
        height: 180,
        bio: 'New bio content',
        isPublic: true,
        birthDate: new Date(updatePayload.birthDate),
      },
    })
  })

  it('should not be able to update premium fields if user is not premium', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: userId })

    // Mock do usuário grátis (não premium)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: userId,
      name: 'Old Name',
      isSystemAdmin: false,
      clubsOwned: [],
      members_on: [],
      athleteProfile: {
        isPremium: false,
        bio: 'Old bio',
        gender: null,
        weight: 70,
        height: 175,
        instagramUrl: null,
        youtubeUrl: null,
        stravaUrl: null,
        coverUrl: null,
        isPublic: true,
        shoes: null,
        watch: null,
        hasMedicalConditions: false,
        medicalConditions: null,
      },
    } as any)

    const response = await app.inject({
      method: 'PUT',
      url: '/profile/athlete',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        bio: 'Attempting to change bio', // Campo premium
        birthDate: '1995-05-15T00:00:00.000Z',
      },
    })

    expect(response.statusCode).toBe(403)
    expect(response.json().message).toBe(
      'Você tentou alterar campos avançados do perfil que são exclusivos para Atletas Premium.'
    )
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
        birthDate: '1995-05-15T00:00:00.000Z',
      },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().message).toBe('Validation error')
  })
})
