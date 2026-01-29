import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { roleSchema } from '@saas/auth'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { FastifyInstance } from 'fastify/types/instance'
import z from 'zod'

export async function getClubs(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/clubs',
      {
        schema: {
          tags: ['clubs'],
          summary: 'Get club user is a member',
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              clubs: z.array(
                z.object({
                  id: z.uuid(),
                  name: z.string(),
                  slug: z.string(),
                  avatarUrl: z.url().nullable(),
                  role: roleSchema,
                })
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        const clubs = await prisma.club.findMany({
          select: {
            id: true,
            name: true,
            slug: true,
            avatarUrl: true,
            members: {
              select: {
                role: true,
              },
              where: {
                userId,
              },
            },
          },
          where: {
            members: {
              some: {
                userId,
              },
            },
          },
        })

        const clubsWithUserRole = clubs.map(({ members, ...org }) => {
          return {
            ...org,
            role: members[0]?.role,
          }
        })

        return {
          clubs: clubsWithUserRole,
        }
      }
    )
}
