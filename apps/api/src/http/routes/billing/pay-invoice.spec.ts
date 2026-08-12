import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(async (callback) => callback(prisma)),
    member: {
      findFirst: vi.fn(),
    },
    invoice: {
      findUnique: vi.fn(),
      updateMany: vi.fn(),
    },
    auditLog: { create: vi.fn() },
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
    vi.mocked(prisma.invoice.updateMany).mockResolvedValue({ count: 1 })

    const response = await app.inject({
      method: 'PATCH',
      url: `/clubs/acme-club/invoices/${invoiceId}/pay`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(204)
    expect(prisma.invoice.updateMany).toHaveBeenCalledWith({
      where: {
        id: invoiceId,
        clubId: 'club-id',
        status: { in: ['PENDING', 'OVERDUE'] },
      },
      data: expect.objectContaining({
        status: 'PAID',
      }),
    })
  })

  it('should not be able to pay an invoice if user is a ATHLETE', async () => {
    const userId = '4f88e178-57d5-4537-8e68-c1d00c4c4af5'
    const invoiceId = '90f9689b-9c5c-4d8b-96d5-4d8b965c4d8b'
    const token = app.jwt.sign({ sub: userId })

    vi.mocked(prisma.member.findFirst).mockResolvedValue({
      id: 'member-id',
      userId,
      role: 'ATHLETE',
      club: { id: 'club-id', slug: 'acme-club' },
    } as any)

    const response = await app.inject({
      method: 'PATCH',
      url: `/clubs/acme-club/invoices/${invoiceId}/pay`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(403)
  })

  it('should keep an already-paid invoice unchanged on a repeated request', async () => {
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
      status: 'PAID',
    } as any)
    vi.mocked(prisma.invoice.updateMany).mockResolvedValue({ count: 0 })

    const response = await app.inject({
      method: 'PATCH',
      url: `/clubs/acme-club/invoices/${invoiceId}/pay`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(204)
    expect(prisma.invoice.updateMany).not.toHaveBeenCalled()
  })

  it('should return 409 for an invoice in a terminal invalid state', async () => {
    const userId = '4f88e178-8d75-474c-8975-c54d8b965c4d'
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
      status: 'CANCELLED',
    } as any)

    const response = await app.inject({
      method: 'PATCH',
      url: `/clubs/acme-club/invoices/${invoiceId}/pay`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(409)
    expect(prisma.invoice.updateMany).not.toHaveBeenCalled()
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
    expect(prisma.invoice.findUnique).toHaveBeenCalledWith({
      where: { id: invoiceId, clubId: 'club-id' },
    })
  })
})
