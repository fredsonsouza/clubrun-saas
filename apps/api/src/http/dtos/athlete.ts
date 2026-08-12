import z from 'zod'

const publicAthleteProfile = z.object({
  isPublic: z.boolean(),
  bio: z.string().nullable(),
  city: z.string().nullable(),
  paceAvg: z.number().nullable(),
  instagramUrl: z.string().nullable(),
  youtubeUrl: z.string().nullable(),
  stravaUrl: z.string().nullable(),
  coverUrl: z.string().nullable(),
  isPremium: z.boolean(),
  isStravaConnected: z.boolean(),
  weight: z.number().nullable().optional(),
  height: z.number().int().nullable().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).nullable().optional(),
  birthDate: z.coerce.date().nullable().optional(),
  shoes: z.string().nullable().optional(),
  shoesMaxDistance: z.number().nullable().optional(),
  shoesRemainingDistance: z.number().nullable().optional(),
  watch: z.string().nullable().optional(),
  hasMedicalConditions: z.boolean().optional(),
  medicalConditions: z.string().nullable().optional(),
})

export const PublicAthleteDto = z.object({
  user: z.object({
    id: z.uuid(),
    name: z.string().nullable(),
    avatarUrl: z.string().nullable(),
  }),
  athleteProfile: publicAthleteProfile.nullable(),
})

export const OwnAthleteDto = PublicAthleteDto.extend({
  athleteProfile: publicAthleteProfile
    .extend({
      weight: z.number().nullable(),
      height: z.number().int().nullable(),
      gender: z.enum(['MALE', 'FEMALE', 'OTHER']).nullable(),
      birthDate: z.coerce.date(),
      shoes: z.string().nullable(),
      shoesMaxDistance: z.number().nullable(),
      shoesRemainingDistance: z.number().nullable(),
      watch: z.string().nullable(),
    })
    .nullable(),
})

export const CoachAthleteDto = PublicAthleteDto.extend({
  athleteProfile: publicAthleteProfile
    .extend({
      weight: z.number().nullable(),
      height: z.number().int().nullable(),
      gender: z.enum(['MALE', 'FEMALE', 'OTHER']).nullable(),
      birthDate: z.coerce.date(),
      shoes: z.string().nullable(),
      shoesRemainingDistance: z.number().nullable(),
      watch: z.string().nullable(),
    })
    .nullable(),
})

export const MedicalAthleteDto = z.object({
  userId: z.uuid(),
  hasMedicalConditions: z.boolean(),
  medicalConditions: z.string().nullable(),
})

export const publicAthleteSelect = {
  id: true,
  name: true,
  avatarUrl: true,
  athleteProfile: {
    select: {
      isPublic: true,
      bio: true,
      city: true,
      paceAvg: true,
      instagramUrl: true,
      youtubeUrl: true,
      stravaUrl: true,
      coverUrl: true,
      isPremium: true,
      stravaAthleteId: true,
    },
  },
} as const

export const ownAthleteSelect = {
  id: true,
  name: true,
  avatarUrl: true,
  athleteProfile: {
    select: {
      isPublic: true,
      bio: true,
      city: true,
      paceAvg: true,
      weight: true,
      height: true,
      gender: true,
      birthDate: true,
      instagramUrl: true,
      youtubeUrl: true,
      stravaUrl: true,
      coverUrl: true,
      isPremium: true,
      shoes: true,
      shoesMaxDistance: true,
      shoesRemainingDistance: true,
      watch: true,
      stravaAthleteId: true,
    },
  },
} as const

export const ownAthleteProfileResponseSelect = {
  userId: true,
  isPublic: true,
  bio: true,
  city: true,
  paceAvg: true,
  weight: true,
  height: true,
  gender: true,
  birthDate: true,
  instagramUrl: true,
  youtubeUrl: true,
  stravaUrl: true,
  coverUrl: true,
  isPremium: true,
  shoes: true,
  shoesMaxDistance: true,
  shoesRemainingDistance: true,
  watch: true,
  stravaAthleteId: true,
} as const
