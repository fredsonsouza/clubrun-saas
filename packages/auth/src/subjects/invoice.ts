import { z } from 'zod'
import { invoiceSchema } from '../models/invoice'

export const invoiceSubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('get'),
    z.literal('create'),
    z.literal('update'),
    z.literal('delete'),
  ]),
  z.union([z.literal('Invoice'), invoiceSchema]),
])

export type InvoiceSubject = z.infer<typeof invoiceSubject>
