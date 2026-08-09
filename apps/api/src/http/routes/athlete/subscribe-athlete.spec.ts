import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    athleteProfile: {
      update: vi.fn(),
    },
  },
}))

describe('Subscribe Athlete (Unit)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns 403 without mutating premium outside development/test', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const token = app.jwt.sign({
      sub: '4f88e178-57d5-4537-8e68-c1d00c4c4af5',
    })

    const response = await app.inject({
      method: 'POST',
      url: '/profile/athlete/subscribe',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(403)
    expect(prisma.athleteProfile.update).not.toHaveBeenCalled()
  })

  it('should be able to activate premium subscription', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.athleteProfile.update).mockResolvedValue({
      userId,
      isPremium: true,
    } as any)

    const response = await app.inject({
      method: 'POST',
      url: '/profile/athlete/subscribe',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({
      success: true,
      message: 'Assinatura premium do atleta ativada com sucesso.',
      isPremium: true,
    })
    expect(prisma.athleteProfile.update).toHaveBeenCalledWith({
      where: { userId },
      data: {
        isPremium: true,
      },
    })
  })
})
