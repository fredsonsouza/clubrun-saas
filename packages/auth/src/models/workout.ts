import z from 'zod'

export const workoutSchema = z.object({
  __typename: z.literal('Workout').default('Workout'),

  id: z.string(),
  athleteId: z.string(),
})
export type Workout = z.infer<typeof workoutSchema>
