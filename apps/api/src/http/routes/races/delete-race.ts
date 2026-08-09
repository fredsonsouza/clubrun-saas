import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function deleteRace(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/clubs/:slug/races/:raceId',
      {
        schema: {
          tags: ['races'],
          summary: 'Delete a race',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            raceId: z.string().uuid(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug, raceId } = request.params
        const { memberShip, club } = await request.getUserMemberShip(slug)

        if (memberShip.role !== 'OWNER' && memberShip.role !== 'MANAGER') {
          throw new UnauthorizedError(
            'Only owners and managers can delete races.'
          )
        }

        const race = await prisma.race.findUnique({
          where: {
            id: raceId,
            clubId: club.id,
          },
        })

        if (!race) {
          throw new BadRequestError('Race not found')
        }

        await prisma.race.delete({
          where: {
            id: raceId,
          },
        })

        return reply.status(204).send(null)
      }
    )
}
