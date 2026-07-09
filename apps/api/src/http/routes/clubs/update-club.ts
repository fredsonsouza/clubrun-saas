import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/utils/audit-log'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { clubSchema } from '@saas/auth'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function updateClub(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/clubs/:slug',
      {
        schema: {
          tags: ['clubs'],
          summary: 'Update a club details',
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string(),
            domain: z.string().nullish(),
            cnpj: z.string().nullish(),
            description: z.string().nullish(),
            city: z.string().nullish(),
            state: z.string().nullish(),
            avatarUrl: z.string().nullish(),
            bannerUrl: z.string().nullish(),
            shouldAttachUsersByDomain: z.boolean().optional(),
          }),
          params: z.object({
            slug: z.string(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params
        const userId = await request.getCurrentUserId()
        const { club, memberShip } = await request.getUserMemberShip(slug)

        if (club.status === 'DEACTIVATED') {
          throw new UnauthorizedError(
            `This club is deactivated and cannot be updated.`
          )
        }

        const {
          name,
          domain,
          shouldAttachUsersByDomain,
          cnpj,
          description,
          city,
          state,
          avatarUrl,
          bannerUrl,
        } = request.body

        const authClub = clubSchema.parse(club)

        const { cannot } = getUserPermissions(
          userId,
          memberShip.role,
          memberShip.isSystemAdmin
        )

        if (cannot('update', authClub)) {
          throw new UnauthorizedError(`You're not allowed to update this club`)
        }

        if (domain) {
          const culbByDomain = await prisma.club.findFirst({
            where: {
              domain,
              id: {
                not: club.id,
              },
            },
          })

          if (culbByDomain) {
            throw new BadRequestError(
              'Another club with same domain already exists!'
            )
          }
        }
        await prisma.club.update({
          where: {
            id: club.id,
          },
          data: {
            name,
            domain,
            shouldAttachUsersByDomain,
            cnpj,
            description,
            city,
            state,
            avatarUrl,
            bannerUrl,
          },
        })

        await createAuditLog({
          action: 'UPDATE_CLUB',
          entity: 'CLUB',
          entityId: club.id,
          userId,
          payload: {
            name,
            domain,
            cnpj,
            description,
            city,
            state,
            avatarUrl,
            bannerUrl,
          },
        })

        return reply.status(204).send()
      }
    )
}
