import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    member: {
      findFirst: vi.fn(),
    },
    club: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}))

describe('Update Club (Unit)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be able to update club details as owner', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: '81f02179-8d75-474c-8975-c54d8b965c4d',
      userId,
      role: 'OWNER',
      club: { id: '515560b4-367d-44a6-89bf-ba486e9e46a7', slug: 'acme-club', ownerId: userId },
    } as any)

    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any)
    vi.mocked(prisma.club.findFirst).mockResolvedValue(null)

    const response = await app.inject({
      method: 'PUT',
      url: '/clubs/acme-club',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        name: 'Updated Name',
        domain: 'updated.com',
      },
    })

    expect(response.statusCode).toBe(204)
    expect(prisma.club.update).toHaveBeenCalledWith({
      where: { id: '515560b4-367d-44a6-89bf-ba486e9e46a7' },
      data: expect.objectContaining({
        name: 'Updated Name',
        domain: 'updated.com',
      }),
    })
  })

  it('should not be able to update club if user is a ATHLETE', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'member-id',
      userId,
      role: 'ATHLETE',
      club: { id: 'club-id', slug: 'acme-club', ownerId: 'another-user' },
    } as any)

    const response = await app.inject({
      method: 'PUT',
      url: '/clubs/acme-club',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        name: 'Updated Name',
      },
    })

    expect(response.statusCode).toBe(401)
  })
})
