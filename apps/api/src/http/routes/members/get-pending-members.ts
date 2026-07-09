import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { FastifyInstance } from 'fastify/types/instance'
import z from 'zod'

export async function getPendingMembers(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/clubs/:slug/members/pending',
      {
        schema: {
          tags: ['members'],
          summary: 'Get club pending members requests',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              members: z.array(
                z.object({
                  id: z.uuid(),
                  role: z.any(),
                  status: z.any(),
                  user: z.object({
                    id: z.uuid(),
                    name: z.string().nullable(),
                    email: z.string().email(),
                    avatarUrl: z.string().nullable(),
                  }),
                })
              ),
            }),
          },
        },
      },
      async (request) => {
        const { slug } = request.params
        const { club } = await request.getUserMemberShip(slug)

        const members = await prisma.member.findMany({
          where: {
            clubId: club.id,
            status: 'PENDING',
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        })

        return {
          members,
        }
      }
    )
}
