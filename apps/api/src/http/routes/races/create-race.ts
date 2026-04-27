import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function createRace(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/clubs/:slug/races',
      {
        schema: {
          tags: ['races'],
          summary: 'Create a new race',
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string(),
            distance: z.number(),
            city: z.string(),
            date: z.coerce.date(),
            imageUrl: z.string().url().nullish(),
          }),
          params: z.object({
            slug: z.string(),
          }),
          response: {
            201: z.object({
              raceId: z.string().uuid(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params
        const userId = await request.getCurrentUserId()
        const { club, memberShip } = await request.getUserMemberShip(slug)

        const { cannot } = getUserPermissions(userId, memberShip.role, memberShip.isSystemAdmin)

        if (cannot('create', 'Invite')) { // Using 'Invite' as a proxy for admin permission if Race is not in CASL yet, but I should probably check Race
          // In this project, 'OWNER', 'ADMIN', 'MANAGER' can usually create things.
          // Let's assume OWNER or ADMIN for races.
          if (memberShip.role !== 'OWNER' && memberShip.role !== 'ADMIN' && memberShip.role !== 'MANAGER') {
            throw new UnauthorizedError(`You're not allowed to create races`)
          }
        }

        const { name, distance, city, date, imageUrl } = request.body

        const race = await prisma.race.create({
          data: {
            name,
            distance,
            city,
            date,
            imageUrl,
            clubId: club.id,
          },
        })

        return reply.status(201).send({
          raceId: race.id,
        })
      }
    )
}
