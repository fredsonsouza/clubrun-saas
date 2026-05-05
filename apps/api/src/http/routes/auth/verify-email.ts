import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'

import { auth } from '@/http/middlewares/auth'

export async function verifyEmail(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
    '/auth/verify-email',
    {
      schema: {
        tags: ['auth'],
        summary: 'Verify user email',
        security: [{ bearerAuth: [] }],
        body: z.object({
          code: z.string().length(6),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { code } = request.body
      const userId = await request.getCurrentUserId()

      const token = await prisma.token.findFirst({
        where: {
          code,
          userId,
          type: 'EMAIL_VERIFICATION',
        },
      })

      if (!token) {
        throw new BadRequestError('Código de verificação inválido ou expirado.')
      }

      await prisma.$transaction([
        prisma.user.update({
          where: { id: token.userId },
          data: { emailVerifiedAt: new Date() },
        }),
        prisma.token.delete({
          where: { id: token.id },
        }),
      ])


      return reply.status(204).send()
    }
  )
}
