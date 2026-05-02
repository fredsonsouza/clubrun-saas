import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { FastifyInstance } from 'fastify/types/instance'
import z from 'zod'

export async function getExploreClubs(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/explore/clubs',
      {
        schema: {
          tags: ['clubs'],
          summary: 'Get all clubs to explore',
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              clubs: z.array(
                z.object({
                  id: z.uuid(),
                  name: z.string(),
                  slug: z.string(),
                  description: z.string().nullable(),
                  avatarUrl: z.string().nullable(),
                  membersCount: z.number(),
                  location: z.string().nullable(),
                  membershipStatus: z.enum(['ATHLETE', 'NONE', 'PENDING']),
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
            description: true,
            avatarUrl: true,
            city: true,
            state: true,
            _count: {
              select: { members: true }
            },
            members: {
              select: {
                status: true,
              },
              where: {
                userId,
              },
            },
          },
        })

        const formattedClubs = clubs.map((club) => {
          const userMember = club.members[0]
          
          let membershipStatus: 'ATHLETE' | 'NONE' | 'PENDING' = 'NONE'
          if (userMember) {
            membershipStatus = userMember.status === 'ACTIVE' ? 'ATHLETE' : 'PENDING'
          }

          const location = club.city && club.state ? `${club.city}, ${club.state}` : 'Local não informado'

          return {
            id: club.id,
            name: club.name,
            slug: club.slug,
            description: club.description,
            avatarUrl: club.avatarUrl,
            membersCount: club._count.members,
            location,
            membershipStatus,
          }
        })

        return {
          clubs: formattedClubs,
        }
      }
    )
}
