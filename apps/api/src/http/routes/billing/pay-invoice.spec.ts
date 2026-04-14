import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    member: {
      findFirst: vi.fn(),
    },
    invoice: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

describe('Pay Invoice (Unit)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be able to mark an invoice as paid as owner', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const invoiceId = '90f9689b-9c5c-4d8b-96d5-4d8b965c4d8b'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'member-id',
      userId,
      role: 'OWNER',
      club: { id: 'club-id', slug: 'acme-club' },
    } as any)

    vi.mocked(prisma.invoice.findUnique).mockResolvedValue({
      id: invoiceId,
      status: 'PENDING',
    } as any)

    const response = await app.inject({
      method: 'PATCH',
      url: `/clubs/acme-club/invoices/${invoiceId}/pay`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(204)
    expect(prisma.invoice.update).toHaveBeenCalledWith({
      where: { id: invoiceId },
      data: expect.objectContaining({
        status: 'PAID',
      }),
    })
  })

  it('should not be able to pay an invoice if user is a MEMBER', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const invoiceId = '90f9689b-9c5c-4d8b-96d5-4d8b965c4d8b'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'member-id',
      userId,
      role: 'MEMBER',
      club: { id: 'club-id', slug: 'acme-club' },
    } as any)

    const response = await app.inject({
      method: 'PATCH',
      url: `/clubs/acme-club/invoices/${invoiceId}/pay`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(401)
  })

  it('should return 404 if invoice does not exist', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const invoiceId = '90f9689b-9c5c-4d8b-96d5-4d8b965c4d8b'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'member-id',
      userId,
      role: 'OWNER',
      club: { id: 'club-id', slug: 'acme-club' },
    } as any)

    vi.mocked(prisma.invoice.findUnique).mockResolvedValue(null)

    const response = await app.inject({
      method: 'PATCH',
      url: `/clubs/acme-club/invoices/${invoiceId}/pay`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(404)
    expect(response.json().message).toBe('Invoice not found')
  })
})
