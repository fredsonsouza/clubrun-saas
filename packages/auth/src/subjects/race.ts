import { z } from 'zod'

export const raceSubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('get'),
    z.literal('create'),
    z.literal('delete'),
  ]),
  z.literal('Race'),
])
export type RaceSubject = z.infer<typeof raceSubject>
