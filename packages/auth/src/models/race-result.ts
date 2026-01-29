import z from 'zod'

export const raceResultSchema = z.object({
  __typename: z.literal('RaceResult').default('RaceResult'),
  id: z.string(),
})

export type RaceResult = z.infer<typeof raceResultSchema>
