import { z } from 'zod'

export const rankingSubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('get'),
    z.literal('create'),
    z.literal('update'),
    z.literal('delete'),
  ]),
  z.literal('Ranking'),
])
export type RankingSubject = z.infer<typeof rankingSubject>
