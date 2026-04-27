import { api } from './api-client'

export async function transferClubOwnership({
  slug,
  transferToUserId,
}: {
  slug: string
  transferToUserId: string
}) {
  await api.patch(`clubs/${slug}/owner`, {
    json: {
      transferToUserId,
    },
  })
}
