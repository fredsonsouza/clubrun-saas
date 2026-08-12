import { z } from 'zod'
import { rankingSchema } from '../models/ranking'

export const rankingSubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('get'),
    z.literal('get_public'),
    z.literal('create'),
    z.literal('update'),
    z.literal('delete'),
  ]),
  z.union([z.literal('Ranking'), rankingSchema]),
])
export type RankingSubject = z.infer<typeof rankingSubject>
