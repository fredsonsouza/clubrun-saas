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
    member: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    club: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}))

describe('Create Club (Unit)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it.each(['production', 'staging', 'preview'])(
    'allows only system admins to create clubs when NODE_ENV=%s',
    async (nodeEnv) => {
      vi.stubEnv('NODE_ENV', nodeEnv)
      const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
      const token = app.jwt.sign({ sub: userId })

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        isSystemAdmin: false,
      } as any)

      const response = await app.inject({
        method: 'POST',
        url: '/clubs',
        headers: { authorization: `Bearer ${token}` },
        body: { name: 'Blocked Club' },
      })

      expect(response.statusCode).toBe(403)
      expect(prisma.member.findMany).not.toHaveBeenCalled()
      expect(prisma.club.create).not.toHaveBeenCalled()
    }
  )

  it('should be able to create a new club', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'member-id',
      userId,
      role: 'ADMIN',
      user: { isSystemAdmin: false },
      club: { id: 'club-id', slug: 'acme-club' },
    } as any)
    vi.mocked(prisma.member.findMany).mockResolvedValue([])
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: userId,
      isSystemAdmin: false,
    } as any)
    vi.mocked(prisma.club.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.club.create).mockResolvedValue({
      id: '515560b4-367d-44a6-89bf-ba486e9e46a7',
    } as any)

    const response = await app.inject({
      method: 'POST',
      url: '/clubs',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        name: 'New Club',
        domain: 'newclub.com',
        shouldAttachUsersByDomain: true,
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toEqual({
      clubId: '515560b4-367d-44a6-89bf-ba486e9e46a7',
    })
    expect(prisma.club.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'New Club',
          ownerId: userId,
        }),
      })
    )
  })

  it('should not be able to create a club if user already belongs to an active club', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findMany).mockResolvedValue([
      { role: 'ATHLETE', status: 'ACTIVE' } as any,
    ])
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: userId,
      isSystemAdmin: false,
    } as any)

    const response = await app.inject({
      method: 'POST',
      url: '/clubs',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        name: 'New Club',
      },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().message).toBe(
      'As a member, coach, or manager, you can only belong to one active club. Owners can have multiple clubs.'
    )
  })

  it('should not be able to create a club with existing domain', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findMany).mockResolvedValue([])
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: userId,
      isSystemAdmin: false,
    } as any)
    // First call (slug check) returns null, second call (domain check) returns existing-club
    vi.mocked(prisma.club.findUnique)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'existing-club' } as any)

    const response = await app.inject({
      method: 'POST',
      url: '/clubs',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        name: 'New Club',
        domain: 'existing.com',
      },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().message).toBe(
      'Another club with same domain already exists!'
    )
  })

  it('should not be able to create a club with existing name (slug)', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findMany).mockResolvedValue([])
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: userId,
      isSystemAdmin: false,
    } as any)
    vi.mocked(prisma.club.findUnique).mockResolvedValue({
      id: 'existing-club',
    } as any)

    const response = await app.inject({
      method: 'POST',
      url: '/clubs',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        name: 'Existing Club',
      },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().message).toBe(
      'Another club with same name already exists!'
    )
  })
})
