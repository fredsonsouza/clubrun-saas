import z from 'zod'
import { clubSchema } from '../models/club'

export const clubSubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('update'),
    z.literal('delete'),
    z.literal('transfer_ownership'),
  ]),
  z.union([z.literal('Club'), clubSchema]),
])

export type ClubSubject = z.infer<typeof clubSubject>
