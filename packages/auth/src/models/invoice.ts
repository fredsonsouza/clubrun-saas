import { z } from 'zod'

export const invoiceSchema = z.object({
  __typename: z.literal('Invoice').default('Invoice'),
  id: z.string(),
  clubId: z.string(),
  memberId: z.string(),
})

export type Invoice = z.infer<typeof invoiceSchema>
