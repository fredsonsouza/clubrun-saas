import z from 'zod'

export const clubSchema = z.object({
  __typename: z.literal('Club').default('Club'),
  id: z.string(),
  ownerId: z.string(),
})
export type Club = z.infer<typeof clubSchema>
