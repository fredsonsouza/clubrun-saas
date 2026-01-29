import { prisma } from '@/lib/prisma'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { FastifyInstance } from 'fastify/types/instance'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'
import { roleSchema } from '@saas/auth'

export async function getInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/invites/:inviteId',
    {
      schema: {
        tags: ['invites'],
        summary: 'Get a  invite',
        params: z.object({
          inviteId: z.string(),
        }),
        response: {
          200: z.object({
            invite: z.object({
              id: z.uuid(),
              role: roleSchema,
              email: z.email(),
              createdAt: z.date(),
              club: z.object({
                name: z.string(),
              }),
              author: z
                .object({
                  id: z.uuid(),
                  name: z.string().nullable(),
                  avatarUrl: z.url().nullable(),
                })
                .nullable(),
            }),
          }),
        },
      },
    },
    async (request) => {
      const { inviteId } = request.params

      const invite = await prisma.invite.findUnique({
        where: {
          id: inviteId,
        },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          club: {
            select: {
              name: true,
            },
          },
        },
      })

      if (!invite) {
        throw new BadRequestError(`Invite not found`)
      }

      return { invite }
    }
  )
}
