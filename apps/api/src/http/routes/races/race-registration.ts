import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { isBefore, subHours } from 'date-fns'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'
import { ForbiddenError } from '../_errors/forbidden-error'
import { ResourceNotFoundError } from '../_errors/resource-not-found-error'

function assertActiveTenantAndMembership(
  club: { status: string },
  membership: { status: string }
) {
  if (club.status !== 'ACTIVE') {
    throw new ForbiddenError('Este clube não está ativo.')
  }

  if (membership.status !== 'ACTIVE') {
    throw new ForbiddenError('É necessário ser membro ativo deste clube.')
  }
}

function assertRegistrationWindowIsOpen(raceDate: Date) {
  if (isBefore(subHours(new Date(raceDate), 1), new Date())) {
    throw new BadRequestError('As inscrições encerram 1 hora antes da largada.')
  }
}

const paramsSchema = z.object({
  slug: z.string(),
  raceId: z.string().uuid(),
})

export async function raceRegistration(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/clubs/:slug/races/:raceId/participants/me',
      {
        schema: {
          tags: ['races'],
          summary: 'Ensure the current athlete is registered for a race',
          security: [{ bearerAuth: [] }],
          params: paramsSchema,
          response: {
            200: z.object({
              isRegistered: z.literal(true),
              message: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug, raceId } = request.params
        const userId = await request.getCurrentUserId()
        const { club, memberShip } = await request.getUserMemberShip(slug)

        assertActiveTenantAndMembership(club, memberShip)

        const race = await prisma.race.findFirst({
          where: {
            id: raceId,
            clubId: club.id,
          },
        })

        if (!race) {
          throw new ResourceNotFoundError('Corrida não encontrada.')
        }

        assertRegistrationWindowIsOpen(race.date)

        const conflictingRegistration = await prisma.raceParticipant.findFirst({
          where: {
            athleteId: userId,
            raceId: { not: raceId },
            race: {
              date: race.date,
            },
          },
          include: {
            race: true,
          },
        })

        if (conflictingRegistration) {
          throw new BadRequestError(
            `Você já está inscrito na corrida "${conflictingRegistration.race.name}" no mesmo horário.`
          )
        }

        await prisma.raceParticipant.upsert({
          where: {
            raceId_athleteId: {
              raceId,
              athleteId: userId,
            },
          },
          create: {
            raceId,
            athleteId: userId,
          },
          update: {},
        })

        return reply.status(200).send({
          isRegistered: true,
          message: 'Inscrição confirmada com sucesso.',
        })
      }
    )
    .delete(
      '/clubs/:slug/races/:raceId/participants/me',
      {
        schema: {
          tags: ['races'],
          summary: 'Ensure the current athlete is not registered for a race',
          security: [{ bearerAuth: [] }],
          params: paramsSchema,
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug, raceId } = request.params
        const userId = await request.getCurrentUserId()
        const { club, memberShip } = await request.getUserMemberShip(slug)

        assertActiveTenantAndMembership(club, memberShip)

        const race = await prisma.race.findFirst({
          where: {
            id: raceId,
            clubId: club.id,
          },
        })

        if (!race) {
          throw new ResourceNotFoundError('Corrida não encontrada.')
        }

        assertRegistrationWindowIsOpen(race.date)

        await prisma.raceParticipant.deleteMany({
          where: {
            raceId,
            athleteId: userId,
          },
        })

        return reply.status(204).send(null)
      }
    )
}
