import { vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    member: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

describe('Get Pending Members (Unit)', () => {
  const ownerId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
  const clubId = '515560b4-367d-44a6-89bf-ba486e9e46a7'

  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should allow the real owner and omit pending member email', async () => {
    const token = app.jwt.sign({ sub: ownerId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'owner-member-id',
      userId: ownerId,
      role: 'OWNER',
      status: 'ACTIVE',
      clubId,
      club: { id: clubId, slug: 'acme-club', ownerId },
      user: { isSystemAdmin: false },
    } as any)
    vi.mocked(prisma.member.findMany).mockResolvedValue([
      {
        id: '81f02179-8d75-474c-8975-c54d8b965c4d',
        role: 'ATHLETE',
        status: 'PENDING',
        user: {
          id: '90f9689b-9c5c-4d8b-96d5-4d8b965c4d8b',
          name: 'Pending Athlete',
          avatarUrl: null,
        },
      },
    ] as any)

    const response = await app.inject({
      method: 'GET',
      url: '/clubs/acme-club/members/pending',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().members[0].user).not.toHaveProperty('email')
    expect(prisma.member.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { clubId, status: 'PENDING' },
      })
    )
  })

  it('should reject an admin who is not the real owner', async () => {
    const adminId = '90f9689b-9c5c-4d8b-96d5-4d8b965c4d8b'
    const token = app.jwt.sign({ sub: adminId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'admin-member-id',
      userId: adminId,
      role: 'ADMIN',
      status: 'ACTIVE',
      clubId,
      club: { id: clubId, slug: 'acme-club', ownerId },
      user: { isSystemAdmin: false },
    } as any)

    const response = await app.inject({
      method: 'GET',
      url: '/clubs/acme-club/members/pending',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(403)
    expect(prisma.member.findMany).not.toHaveBeenCalled()
  })
})
