import z from 'zod'

export const athleteprofileSchema = z.object({
  __typename: z.literal('AthleteProfile').default('AthleteProfile'),

  id: z.string(),
})
export type AthleteProfile = z.infer<typeof athleteprofileSchema>
