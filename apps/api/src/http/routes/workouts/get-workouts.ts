import {
  requireActiveMembership,
  requireClubAbility,
} from '@/authorization/club-authorization'
import { PublicWorkoutDto, publicWorkoutSelect } from '@/http/dtos'
import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getEffectiveClubRole } from '@/utils/get-user-permissions'
import { getWorkoutVisibilityFilter } from '@/utils/workout-visibility'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export async function getWorkouts(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/clubs/:slug/workouts',
      {
        schema: {
          tags: ['workouts'],
          summary: 'Get club workouts',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          querystring: z.object({
            page: z.coerce.number().min(1).default(1),
            limit: z.coerce.number().min(1).max(100).default(20),
            status: z.enum(['PLANNED', 'COMPLETED']).default('COMPLETED'),
            athleteId: z.string().uuid().optional(),
          }),
          response: {
            200: z.object({
              workouts: z.array(PublicWorkoutDto),
              meta: z.object({
                total: z.number(),
                page: z.number(),
                limit: z.number(),
                totalPages: z.number(),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params
        const { page, limit, status, athleteId } = request.query
        const skip = (page - 1) * limit
        const context = await requireActiveMembership(request, slug)
        requireClubAbility(context, 'get', 'Workout')
        const { club, memberShip, userId } = context

        const effectiveRole = getEffectiveClubRole(
          userId,
          memberShip.role,
          club.ownerId
        )
        const visibilityFilter = getWorkoutVisibilityFilter(
          userId,
          effectiveRole,
          memberShip.isSystemAdmin
        )
        const where = {
          clubId: club.id,
          status,
          ...(athleteId ? { athleteId } : {}),
          ...visibilityFilter,
        }

        const [total, workouts] = await Promise.all([
          prisma.workout.count({
            where,
          }),
          prisma.workout.findMany({
            select: publicWorkoutSelect,
            where,
            orderBy: {
              createdAt: 'desc',
            },
            take: limit,
            skip,
          }),
        ])

        const formattedWorkouts = workouts.map((workout) => {
          const reactionCounts: Record<string, number> = {}
          let currentUserReaction: string | null = null
          ;(workout.reactions || []).forEach((reaction) => {
            reactionCounts[reaction.type] =
              (reactionCounts[reaction.type] || 0) + 1
            if (reaction.userId === userId) {
              currentUserReaction = reaction.type
            }
          })

          const formattedReactions = Object.entries(reactionCounts).map(
            ([type, count]) => ({
              type,
              count,
            })
          )

          const { reactions: _, ...rest } = workout

          return {
            ...rest,
            reactions: formattedReactions,
            currentUserReaction,
          }
        })

        return reply.send({
          workouts: formattedWorkouts,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        })
      }
    )
}
