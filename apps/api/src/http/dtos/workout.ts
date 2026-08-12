import z from 'zod'

const workoutType = z.enum([
  'EASY',
  'INTERVAL',
  'TEMPO',
  'LONG',
  'RECOVERY',
  'RACE',
  'STRENGTH',
  'WALK',
])

const workoutBase = z.object({
  id: z.uuid(),
  title: z.string().nullable(),
  slug: z.string().nullable().optional(),
  distance: z.number(),
  duration: z.number().nullable(),
  pace: z.number().nullable(),
  type: workoutType,
  status: z.enum(['PLANNED', 'COMPLETED']),
  assignmentMode: z.enum(['GOAL', 'FREE']).nullable(),
  date: z.coerce.date(),
  imageUrl: z.string().nullable(),
  clubId: z.uuid(),
  visibility: z.enum(['PUBLIC', 'COACH_ONLY', 'PRIVATE']),
  createdAt: z.coerce.date(),
  athlete: z.object({
    id: z.uuid(),
    name: z.string().nullable(),
    avatarUrl: z.string().nullable(),
  }),
})

export const PublicWorkoutDto = workoutBase.extend({
  club: z
    .object({
      name: z.string(),
      slug: z.string(),
      avatarUrl: z.string().nullable().optional(),
    })
    .optional(),
  reactions: z
    .array(z.object({ type: z.string(), count: z.number() }))
    .optional(),
  currentUserReaction: z.string().nullable().optional(),
})

export const PrivateWorkoutDto = workoutBase.extend({
  notes: z.string().nullable(),
  targetDistance: z.number().nullable(),
  targetDuration: z.number().nullable(),
  routeData: z.json().nullable().optional(),
})

export const publicWorkoutSelect = {
  id: true,
  title: true,
  slug: true,
  imageUrl: true,
  clubId: true,
  visibility: true,
  distance: true,
  duration: true,
  pace: true,
  type: true,
  status: true,
  assignmentMode: true,
  date: true,
  createdAt: true,
  athlete: {
    select: { id: true, name: true, avatarUrl: true },
  },
  club: {
    select: { name: true, slug: true, avatarUrl: true },
  },
  reactions: {
    select: { type: true, userId: true },
  },
} as const

export const privateWorkoutSelect = {
  id: true,
  title: true,
  slug: true,
  imageUrl: true,
  clubId: true,
  visibility: true,
  distance: true,
  duration: true,
  pace: true,
  type: true,
  status: true,
  assignmentMode: true,
  date: true,
  notes: true,
  targetDistance: true,
  targetDuration: true,
  createdAt: true,
  athlete: {
    select: { id: true, name: true, avatarUrl: true },
  },
} as const
