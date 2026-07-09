import z from 'zod'

export const workoutSchema = z.object({
  __typename: z.literal('Workout').default('Workout'),

  id: z.string(),
  athleteId: z.string(),
  clubId: z.string(),
  visibility: z.enum(['PUBLIC', 'COACH_ONLY', 'PRIVATE']),
})
export type Workout = z.infer<typeof workoutSchema>
