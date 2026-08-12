import { z } from 'zod'

export const billingResourceSchema = z.object({
  __typename: z.literal('Billing').default('Billing'),
  id: z.string(),
  clubId: z.string(),
})

export const billingSubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('get'),
    z.literal('update'),
    z.literal('export'),
  ]),
  z.union([z.literal('Billing'), billingResourceSchema]),
])
export type BillingSubject = z.infer<typeof billingSubject>
