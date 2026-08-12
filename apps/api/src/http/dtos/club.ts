import z from 'zod'

export const PublicClubDto = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  avatarUrl: z.string().nullable(),
  description: z.string().nullable(),
})

export const InternalClubDto = PublicClubDto.extend({
  domain: z.string().nullable(),
  shouldAttachUsersByDomain: z.boolean(),
  bannerUrl: z.string().nullable(),
  cnpj: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  status: z.enum(['ACTIVE', 'DEACTIVATED']),
  subscriptionStatus: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  ownerId: z.string(),
})

export const publicClubSelect = {
  id: true,
  name: true,
  slug: true,
  avatarUrl: true,
  description: true,
} as const

export function toPublicClubDto(club: z.infer<typeof PublicClubDto>) {
  return PublicClubDto.parse(club)
}

export function toInternalClubDto(club: z.infer<typeof InternalClubDto>) {
  return InternalClubDto.parse(club)
}
