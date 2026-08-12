import { z } from 'zod'
import { raceSchema } from '../models/race'

export const raceSubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('get'),
    z.literal('get_public'),
    z.literal('create'),
    z.literal('update'),
    z.literal('delete'),
  ]),
  z.union([z.literal('Race'), raceSchema]),
])
export type RaceSubject = z.infer<typeof raceSubject>
