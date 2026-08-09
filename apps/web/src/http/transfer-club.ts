import { mutationApi } from './api-client'

export async function transferClubOwnership({
  slug,
  transferToUserId,
  leaveAfterTransfer,
}: {
  slug: string
  transferToUserId: string
  leaveAfterTransfer: boolean
}) {
  await mutationApi.patch(`clubs/${slug}/owner`, {
    json: {
      transferToUserId,
      leaveAfterTransfer,
    },
  })
}
