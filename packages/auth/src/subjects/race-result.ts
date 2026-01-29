import { z } from 'zod'

export const raceResultSubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('get'),
    z.literal('create'),
    z.literal('update'),
    z.literal('delete'),
  ]),
  z.literal('RaceResult'),
])
export type RaceResultSubject = z.infer<typeof raceResultSubject>
