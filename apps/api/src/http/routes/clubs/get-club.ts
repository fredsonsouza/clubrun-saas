import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { FastifyInstance } from 'fastify/types/instance'
import z from 'zod'

import {
  requireActiveMembership,
  requireClubAbility,
} from '@/authorization/club-authorization'
import { InternalClubDto, toInternalClubDto } from '@/http/dtos'
import { auth } from '@/http/middlewares/auth'

export async function getClub(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/clubs/:slug',
      {
        schema: {
          tags: ['clubs'],
          summary: 'Get details from club',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              club: InternalClubDto,
              membership: z.object({
                role: z.string(),
              }),
            }),
          },
        },
      },
      async (request) => {
        const { slug } = request.params
        const context = await requireActiveMembership(request, slug)
        requireClubAbility(context, 'get', 'Club')
        const { club, memberShip } = context

        return {
          club: toInternalClubDto(club),
          membership: {
            role: memberShip.role,
          },
        }
      }
    )
}
