import { vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    member: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

describe('Update Member Status (Unit)', () => {
  const ownerId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
  const clubId = '515560b4-367d-44a6-89bf-ba486e9e46a7'
  const memberId = '81f02179-8d75-474c-8975-c54d8b965c4d'

  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should allow only the real owner to approve a scoped member', async () => {
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
    vi.mocked(prisma.member.findUnique).mockResolvedValue({
      id: memberId,
      clubId,
      status: 'PENDING',
    } as any)

    const response = await app.inject({
      method: 'PATCH',
      url: `/clubs/acme-club/members/${memberId}/status`,
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        status: 'ACTIVE',
      },
    })

    expect(response.statusCode).toBe(204)
    expect(prisma.member.findUnique).toHaveBeenCalledWith({
      where: { id: memberId, clubId },
    })
    expect(prisma.member.update).toHaveBeenCalledWith({
      where: { id: memberId, clubId },
      data: { status: 'ACTIVE' },
    })
  })

  it('should reject an admin who is not Club.ownerId', async () => {
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
      method: 'PATCH',
      url: `/clubs/acme-club/members/${memberId}/status`,
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        status: 'ACTIVE',
      },
    })

    expect(response.statusCode).toBe(403)
    expect(prisma.member.findUnique).not.toHaveBeenCalled()
    expect(prisma.member.update).not.toHaveBeenCalled()
  })
})
