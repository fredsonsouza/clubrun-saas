import z from 'zod'

export const userResourceSchema = z.object({
  __typename: z.literal('User').default('User'),
  id: z.string(),
  clubId: z.string(),
})

export const userSubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('get'),
    z.literal('update'),
    z.literal('delete'),
    z.literal('update_roles'),
  ]),
  z.union([z.literal('User'), userResourceSchema]),
])

export type UserSubject = z.infer<typeof userSubject>
