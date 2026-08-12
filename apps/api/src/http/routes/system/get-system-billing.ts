import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { ForbiddenError } from '../_errors/forbidden-error'

export async function getSystemBilling(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/system/billing',
      {
        schema: {
          tags: ['system'],
          summary: 'Get global system billing data',
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              billing: z.object({
                mrr: z.number(),
                b2bRevenue: z.number(),
                b2cRevenue: z.number(),
                availableBalance: z.number(),
                transactions: z.array(
                  z.object({
                    id: z.string(),
                    entity: z.string(),
                    type: z.string(),
                    amount: z.number(),
                    date: z.string(),
                    status: z.string(),
                  })
                ),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        const user = await prisma.user.findUnique({
          where: { id: userId },
        })

        if (!user?.isSystemAdmin) {
          throw new ForbiddenError(
            'Only system administrators can access this.'
          )
        }

        const invoices = await prisma.invoice.findMany({
          include: {
            club: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        })

        const paidInvoices = await prisma.invoice.aggregate({
          where: { status: 'PAID' },
          _sum: { amount: true },
        })

        const totalPaid = Number(paidInvoices._sum.amount || 0)

        // For now, B2B is all we have. B2C and balance will be 0 until implementation.
        return reply.send({
          billing: {
            mrr: totalPaid,
            b2bRevenue: totalPaid,
            b2cRevenue: 0,
            availableBalance: 0,
            transactions: invoices.map((invoice) => ({
              id: invoice.id,
              entity: invoice.club.name,
              type: 'Assinatura PRO', // Generic for now
              amount: Number(invoice.amount),
              date: invoice.createdAt.toISOString(),
              status: invoice.status,
            })),
          },
        })
      }
    )
}
