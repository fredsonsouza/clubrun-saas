import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getSystemLogs(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/system/logs',
      {
        schema: {
          tags: ['system'],
          summary: 'Get system audit logs',
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              logs: z.array(
                z.object({
                  id: z.string().uuid(),
                  action: z.string(),
                  entity: z.string(),
                  entityId: z.string(),
                  payload: z.any().nullable(),
                  createdAt: z.date(),
                  user: z.object({
                    name: z.string().nullable(),
                    email: z.string(),
                  }).nullable(),
                })
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        
        const user = await prisma.user.findUnique({
          where: { id: userId }
        })

        if (!user?.isSystemAdmin) {
          throw new UnauthorizedError('Only system administrators can access this.')
        }

        const logs = await prisma.auditLog.findMany({
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 50,
        })

        return reply.send({ logs })
      }
    )
}
