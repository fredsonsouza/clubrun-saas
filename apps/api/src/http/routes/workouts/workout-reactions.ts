import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { ForbiddenError } from '../_errors/forbidden-error'
import { ResourceNotFoundError } from '../_errors/resource-not-found-error'

const reactionTypeSchema = z.enum(['LIKE', 'FIRE', 'CLAP', 'TROPHY'])
const paramsSchema = z.object({
  slug: z.string(),
  workoutId: z.string().uuid(),
})
const responseSchema = z.object({
  currentUserReaction: reactionTypeSchema.nullable(),
  reactions: z.array(
    z.object({
      type: z.string(),
      count: z.number(),
    })
  ),
})

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

function assertWorkoutIsVisible(
  workout: { athleteId: string; visibility: string },
  userId: string,
  role: string
) {
  if (workout.athleteId === userId || workout.visibility === 'PUBLIC') {
    return
  }

  if (
    workout.visibility === 'COACH_ONLY' &&
    ['OWNER', 'MANAGER', 'ADMIN', 'COACH'].includes(role)
  ) {
    return
  }

  throw new ForbiddenError('Você não pode reagir a este treino.')
}

async function getReactionSummary(workoutId: string) {
  const grouped = await prisma.workoutReaction.groupBy({
    by: ['type'],
    where: { workoutId },
    _count: { id: true },
  })

  return grouped.map((reaction) => ({
    type: reaction.type,
    count: reaction._count.id,
  }))
}

export async function workoutReactions(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/clubs/:slug/workouts/:workoutId/reactions/me',
      {
        schema: {
          tags: ['workouts'],
          summary: 'Set the current user reaction on a workout',
          security: [{ bearerAuth: [] }],
          params: paramsSchema,
          body: z.object({
            type: reactionTypeSchema,
          }),
          response: {
            200: responseSchema,
          },
        },
      },
      async (request, reply) => {
        const { slug, workoutId } = request.params
        const { type } = request.body
        const userId = await request.getCurrentUserId()
        const { club, memberShip } = await request.getUserMemberShip(slug)

        assertActiveTenantAndMembership(club, memberShip)

        const workout = await prisma.workout.findFirst({
          where: {
            id: workoutId,
            clubId: club.id,
          },
          select: {
            athleteId: true,
            visibility: true,
          },
        })

        if (!workout) {
          throw new ResourceNotFoundError('Treino não encontrado.')
        }

        assertWorkoutIsVisible(workout, userId, memberShip.role)

        await prisma.workoutReaction.upsert({
          where: {
            workoutId_userId: {
              workoutId,
              userId,
            },
          },
          create: {
            workoutId,
            userId,
            type,
          },
          update: {
            type,
          },
        })

        const reactions = await getReactionSummary(workoutId)

        return reply.status(200).send({
          currentUserReaction: type,
          reactions,
        })
      }
    )
    .delete(
      '/clubs/:slug/workouts/:workoutId/reactions/me',
      {
        schema: {
          tags: ['workouts'],
          summary: 'Remove the current user reaction from a workout',
          security: [{ bearerAuth: [] }],
          params: paramsSchema,
          response: {
            200: responseSchema,
          },
        },
      },
      async (request, reply) => {
        const { slug, workoutId } = request.params
        const userId = await request.getCurrentUserId()
        const { club, memberShip } = await request.getUserMemberShip(slug)

        assertActiveTenantAndMembership(club, memberShip)

        const workout = await prisma.workout.findFirst({
          where: {
            id: workoutId,
            clubId: club.id,
          },
          select: {
            athleteId: true,
            visibility: true,
          },
        })

        if (!workout) {
          throw new ResourceNotFoundError('Treino não encontrado.')
        }

        assertWorkoutIsVisible(workout, userId, memberShip.role)

        await prisma.workoutReaction.deleteMany({
          where: {
            workoutId,
            userId,
          },
        })

        const reactions = await getReactionSummary(workoutId)

        return reply.status(200).send({
          currentUserReaction: null,
          reactions,
        })
      }
    )
}
