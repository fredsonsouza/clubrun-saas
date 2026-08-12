import {
  requireActiveMembership,
  requireClubAbility,
} from '@/authorization/club-authorization'
import { auth } from '@/http/middlewares/auth'
import { ConflictError } from '@/http/routes/_errors/conflict-error'
import { prisma } from '@/lib/prisma'

import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { ResourceNotFoundError } from '../_errors/resource-not-found-error'

export async function payInvoice(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      '/clubs/:slug/invoices/:invoiceId/pay',
      {
        schema: {
          tags: ['billings'],
          summary: 'Mark an invoice as paid',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            invoiceId: z.uuid(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug, invoiceId } = request.params
        const context = await requireActiveMembership(request, slug)
        requireClubAbility(context, 'update', 'Invoice')
        const { club, userId } = context

        const invoice = await prisma.invoice.findUnique({
          where: { id: invoiceId, clubId: club.id },
        })

        if (!invoice) {
          throw new ResourceNotFoundError('Invoice not found')
        }

        if (invoice.status === 'PAID') {
          return reply.status(204).send(null)
        }
        if (!['PENDING', 'OVERDUE'].includes(invoice.status)) {
          throw new ConflictError(
            `Invoice cannot transition from ${invoice.status} to PAID.`
          )
        }

        const paid = await prisma.$transaction(async (tx) => {
          const transitioned = await tx.invoice.updateMany({
            where: {
              id: invoiceId,
              clubId: club.id,
              status: { in: ['PENDING', 'OVERDUE'] },
            },
            data: {
              status: 'PAID',
              paidAt: new Date(),
            },
          })
          if (transitioned.count === 1) {
            await tx.auditLog.create({
              data: {
                action: 'INVOICE_PAID',
                entity: 'INVOICE',
                entityId: invoiceId,
                userId,
                payload: {
                  amount: String(invoice.amount ?? 0),
                  status: 'PAID',
                },
              },
            })
          }
          return transitioned
        })

        if (paid.count === 0) {
          throw new ConflictError('Invoice was changed by another request.')
        }

        return reply.status(204).send(null)
      }
    )
}
