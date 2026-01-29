import z from 'zod'

export const rankingSchema = z.object({
  __typename: z.literal('Ranking').default('Ranking'),
  id: z.string(),
})

export type Ranking = z.infer<typeof rankingSchema>
