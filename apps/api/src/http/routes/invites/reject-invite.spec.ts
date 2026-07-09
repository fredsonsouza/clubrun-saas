import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    invite: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

describe('Reject Invite (Unit)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be able to reject an invite', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const inviteId = '81f02179-8d75-474c-8975-c54d8b965c4d'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: userId,
      email: 'johndoe@example.com',
    } as any)

    vi.mocked(prisma.invite.findUnique).mockResolvedValue({
      id: inviteId,
      email: 'johndoe@example.com',
    } as any)

    const response = await app.inject({
      method: 'POST',
      url: `/invites/${inviteId}/reject`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(204)
    expect(prisma.invite.delete).toHaveBeenCalledWith({
      where: { id: inviteId },
    })
  })
})
