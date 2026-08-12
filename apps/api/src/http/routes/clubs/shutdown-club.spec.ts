import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn((promises) => Promise.all(promises)),
    member: {
      findFirst: vi.fn(),
    },
    club: {
      update: vi.fn(),
      delete: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}))

describe('Shutdown Club (Unit)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be able to shutdown a club as owner', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: '81f02179-8d75-474c-8975-c54d8b965c4d',
      userId,
      role: 'OWNER',
      club: {
        id: '515560b4-367d-44a6-89bf-ba486e9e46a7',
        slug: 'acme-club',
        ownerId: userId,
      },
    } as any)

    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any)
    vi.mocked(prisma.club.update).mockResolvedValue({} as any)

    const response = await app.inject({
      method: 'DELETE',
      url: '/clubs/acme-club',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(204)
    expect(prisma.club.update).toHaveBeenCalledWith({
      where: { id: '515560b4-367d-44a6-89bf-ba486e9e46a7' },
      data: { status: 'DEACTIVATED' },
    })
  })

  it('should not be able to shutdown a club if user is a member', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'member-id',
      userId,
      role: 'ATHLETE',
      club: { id: 'club-id', slug: 'acme-club', ownerId: 'another-user' },
    } as any)

    const response = await app.inject({
      method: 'DELETE',
      url: '/clubs/acme-club',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(403)
  })
})
