import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'
import { clubSchema } from '@saas/auth'
import { UnauthorizedError } from '../_errors/unauthorized-error'
import { getUserPermissions } from '@/utils/get-user-permissions'

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

        const { name, domain, shouldAttachUsersByDomain, cnpj } = request.body

        const authClub = clubSchema.parse(club)

        const { cannot, can } = getUserPermissions(userId, memberShip.role)

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
          },
        })

        return reply.status(204).send()
      }
    )
}
