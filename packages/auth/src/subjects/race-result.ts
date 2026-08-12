import { z } from 'zod'
import { raceResultSchema } from '../models/race-result'

export const raceResultSubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('get'),
    z.literal('get_public'),
    z.literal('create'),
    z.literal('update'),
    z.literal('delete'),
  ]),
  z.union([z.literal('RaceResult'), raceResultSchema]),
])
export type RaceResultSubject = z.infer<typeof raceResultSubject>
