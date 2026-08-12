import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { persistedRoleSchema } from '@saas/auth'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { FastifyInstance } from 'fastify/types/instance'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'
import { ForbiddenError } from '../_errors/forbidden-error'
import { ResourceNotFoundError } from '../_errors/resource-not-found-error'

export async function updateMember(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/clubs/:slug/members/:memberId',
      {
        schema: {
          tags: ['members'],
          summary: 'Update a member',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            memberId: z.uuid(),
          }),
          body: z.object({
            role: persistedRoleSchema,
            status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug, memberId } = request.params
        const userId = await request.getCurrentUserId()

        const { memberShip, club } = await request.getUserMemberShip(slug)

        const { cannot } = getUserPermissions(
          userId,
          memberShip.role,
          memberShip.isSystemAdmin,
          memberShip.clubId ?? club.id,
          club.ownerId
        )

        if (club.ownerId !== userId || cannot('update_roles', 'User')) {
          throw new ForbiddenError(
            `You're not allowed to update roles in this club.`
          )
        }

        const { role, status } = request.body

        if (role === 'OWNER') {
          throw new BadRequestError(
            'Club ownership can only be changed through the transfer flow.'
          )
        }

        const targetMember = await prisma.member.findUnique({
          where: { id: memberId, clubId: club.id },
        })

        if (!targetMember) {
          throw new ResourceNotFoundError('Member not found.')
        }

        if (targetMember.userId === club.ownerId) {
          throw new ForbiddenError(
            'The club owner role can only be changed through the transfer flow.'
          )
        }

        // 1. Prevent self-update of role
        if (targetMember.userId === userId) {
          throw new ForbiddenError('You cannot change your own role.')
        }

        // If promoting to a unique role, demote existing one
        if (role && ['MANAGER', 'COACH', 'BILLING'].includes(role)) {
          await prisma.member.updateMany({
            where: {
              clubId: club.id,
              role: role as any,
              id: { not: memberId },
            },
            data: {
              role: 'ATHLETE',
            },
          })
        }

        await prisma.member.update({
          where: {
            id: memberId,
            clubId: club.id,
          },
          data: {
            ...(role && { role: role as any }),
            ...(status && { status }),
          },
        })

        return reply.status(204).send(null)
      }
    )
}
