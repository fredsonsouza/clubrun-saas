import { auth } from '@/http/middlewares/auth'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { FastifyInstance } from 'fastify/types/instance'
import z from 'zod'
import { roleSchema } from '@saas/auth'

export async function getMemberShip(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/clubs/:slug/membership',
      {
        schema: {
          tags: ['clubs'],
          summary: 'Get user membership on club',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              membership: z.object({
                id: z.uuid(),
                role: roleSchema,
                userId: z.uuid(),
                clubId: z.uuid(),
              }),
            }),
          },
        },
      },
      async (request) => {
        const { slug } = request.params
        const { memberShip } = await request.getUserMemberShip(slug)

        return {
          membership: {
            id: memberShip.id,
            role: roleSchema.parse(memberShip.role),
            userId: memberShip.userId,
            clubId: memberShip.clubId,
          },
        }
      }
    )
}
