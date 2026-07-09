import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { roleSchema } from '@saas/auth'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { FastifyInstance } from 'fastify/types/instance'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

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
            role: roleSchema,
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
          memberShip.isSystemAdmin
        )

        if (cannot('update_roles', 'User')) {
          throw new UnauthorizedError(
            `You're not allowed to update roles in this club.`
          )
        }

        const { role, status } = request.body

        if (role === 'VISITOR') {
          throw new BadRequestError('Cannot update member role to VISITOR.')
        }

        // Fetch the member being updated to check their current role and userId
        const targetMember = await prisma.member.findUnique({
          where: { id: memberId },
        })

        if (!targetMember) {
          throw new BadRequestError('Member not found.')
        }

        // 1. Prevent self-update of role
        if (targetMember.userId === userId) {
          throw new UnauthorizedError('You cannot change your own role.')
        }

        // 2. MANAGER can only be changed by OWNER
        if (targetMember.role === 'MANAGER' && memberShip.role !== 'OWNER') {
          throw new UnauthorizedError(
            "Only the club owner can change a manager's role."
          )
        }

        // 3. To promote someone to MANAGER, requester must be OWNER
        if (role === 'MANAGER' && memberShip.role !== 'OWNER') {
          throw new UnauthorizedError(
            'Only the club owner can appoint a manager.'
          )
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
          },
          data: {
            ...(role && { role: role as any }),
            ...(status && { status }),
          },
        })

        return reply.status(204).send()
      }
    )
}
