import z from 'zod'
import { athleteprofileSchema } from '../models/athlete-profile'

export const athleteprofileSubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('get'),
    z.literal('delete'),
    z.literal('transfer_ownership'),
  ]),
  z.union([z.literal('AthleteProfile'), athleteprofileSchema]),
])

export type AthleteProfileSubject = z.infer<typeof athleteprofileSubject>
