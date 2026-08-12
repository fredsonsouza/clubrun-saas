import z from 'zod'

export const raceSchema = z.object({
  __typename: z.literal('Race').default('Race'),
  id: z.string(),
  clubId: z.string(),
})

export type Race = z.infer<typeof raceSchema>
