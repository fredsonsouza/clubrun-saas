import { auth } from '@/http/middlewares/auth'
import { getUserPermissions } from '@/utils/get-user-permissions'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { UnauthorizedError } from '../_errors/unauthorized-error'
import { prisma } from '@/lib/prisma'
import { ResourceNotFoundError } from '../_errors/resoruce-not-found-error'

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

        const { cannot } = getUserPermissions(userId, memberShip.role)

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
        return reply.status(204).send()
      }
    )
}
