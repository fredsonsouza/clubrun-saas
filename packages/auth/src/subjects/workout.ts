import z from 'zod'
import { workoutSchema } from '../models/workout'

export const workoutSubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('create'),
    z.literal('get'),
    z.literal('update'),
    z.literal('delete'),
  ]),
  z.union([z.literal('Workout'), workoutSchema]),
])

export type WorkoutSubject = z.infer<typeof workoutSubject>
