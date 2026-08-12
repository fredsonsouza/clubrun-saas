import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { ForbiddenError } from '../_errors/forbidden-error'

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
          querystring: z.object({
            page: z.coerce.number().default(1),
            limit: z.coerce.number().default(50),
            action: z.string().optional(),
            entity: z.string().optional(),
            search: z.string().optional(),
            startDate: z.string().optional(),
            endDate: z.string().optional(),
          }),
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
                  user: z
                    .object({
                      name: z.string().nullable(),
                      email: z.string(),
                    })
                    .nullable(),
                })
              ),
              totalPages: z.number(),
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

        const { page, limit, action, entity, search, startDate, endDate } =
          request.query

        const skip = (page - 1) * limit

        const where: any = {}

        if (action) {
          where.action = action
        }

        if (entity) {
          where.entity = entity
        }

        if (startDate || endDate) {
          where.createdAt = {}
          if (startDate) {
            where.createdAt.gte = new Date(startDate)
          }
          if (endDate) {
            const end = new Date(endDate)
            end.setHours(23, 59, 59, 999)
            where.createdAt.lte = end
          }
        }

        if (search) {
          where.OR = [
            { action: { contains: search, mode: 'insensitive' } },
            { entity: { contains: search, mode: 'insensitive' } },
            {
              user: {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { email: { contains: search, mode: 'insensitive' } },
                ],
              },
            },
          ]
        }

        const [logs, totalCount] = await Promise.all([
          prisma.auditLog.findMany({
            where,
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
            skip,
            take: limit,
          }),
          prisma.auditLog.count({ where }),
        ])

        const totalPages = Math.ceil(totalCount / limit)

        return reply.send({ logs, totalPages })
      }
    )
}
