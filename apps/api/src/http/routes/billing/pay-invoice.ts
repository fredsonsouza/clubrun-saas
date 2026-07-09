import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/utils/audit-log'
import { getUserPermissions } from '@/utils/get-user-permissions'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { ResourceNotFoundError } from '../_errors/resource-not-found-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

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
        const userId = await request.getCurrentUserId()
        const { memberShip } = await request.getUserMemberShip(slug)

        const { cannot } = getUserPermissions(
          userId,
          memberShip.role,
          memberShip.isSystemAdmin
        )

        if (cannot('update', 'Invoice')) {
          throw new UnauthorizedError(
            `You don't have permission to manage invoices`
          )
        }

        const invoice = await prisma.invoice.findUnique({
          where: { id: invoiceId },
        })

        if (!invoice) {
          throw new ResourceNotFoundError('Invoice not found')
        }

        await prisma.invoice.update({
          where: { id: invoiceId },
          data: {
            status: 'PAID',
            paidAt: new Date(),
          },
        })

        createAuditLog({
          action: 'INVOICE_PAID',
          entity: 'INVOICE',
          entityId: invoiceId,
          userId,
          payload: { amount: invoice.amount, status: 'PAID' },
        })

        return reply.status(204).send()
      }
    )
}
