import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    member: {
      findFirst: vi.fn(),
    },
    invite: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

describe('Revoke Invite (Unit)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be able to revoke an invite as admin', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const inviteId = '81f02179-8d75-474c-8975-c54d8b965c4d'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'member-id',
      userId,
      role: 'ADMIN',
      club: { id: '515560b4-367d-44a6-89bf-ba486e9e46a7', slug: 'acme-club' },
    } as any)

    vi.mocked(prisma.invite.findUnique).mockResolvedValue({
      id: inviteId,
      clubId: '515560b4-367d-44a6-89bf-ba486e9e46a7',
    } as any)

    const response = await app.inject({
      method: 'DELETE',
      url: `/clubs/acme-club/invites/${inviteId}`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(204)
    expect(prisma.invite.delete).toHaveBeenCalledWith({
      where: { id: inviteId },
    })
  })

  it('should not be able to revoke an invite if user is a ATHLETE', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const inviteId = '81f02179-8d75-474c-8975-c54d8b965c4d'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'member-id',
      userId,
      role: 'ATHLETE',
      club: { id: '515560b4-367d-44a6-89bf-ba486e9e46a7', slug: 'acme-club' },
    } as any)

    const response = await app.inject({
      method: 'DELETE',
      url: `/clubs/acme-club/invites/${inviteId}`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(403)
  })
})
