import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/utils/audit-log'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export async function createFeedback(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/feedbacks',
      {
        schema: {
          tags: ['system'],
          summary: 'Submit system improvement or bug feedback',
          security: [{ bearerAuth: [] }],
          body: z.object({
            type: z.enum(['BUG', 'SUGGESTION', 'OTHER']),
            comment: z.string().min(10),
          }),
          response: {
            201: z.object({
              message: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { type, comment } = request.body

        const feedback = await prisma.systemFeedback.create({
          data: {
            userId,
            type,
            comment,
          },
        })

        // Registrar no log de auditoria do sistema
        createAuditLog({
          action: 'CREATE_FEEDBACK',
          entity: 'SYSTEM_FEEDBACK',
          entityId: feedback.id,
          userId,
          payload: { type, comment: comment.slice(0, 100) },
        })

        return reply.status(201).send({
          message: 'Feedback enviado com sucesso! Muito obrigado pelo apoio.',
        })
      }
    )
}
