// import z from 'zod'
// export const roleSchema = z.union([
//   z.literal('OWNER'),
//   z.literal('ADMIN'),
//   z.literal('MEMBER'),
//   z.literal('COACH'),
//   z.literal('BILLING'),
// ])

// export type Role = z.infer<typeof roleSchema>

// ARQUIVO MODIFICADO (SOLUÇÃO)
import z from 'zod'
export const roleSchema = z.enum([
  'OWNER',
  'ADMIN',
  'MEMBER',
  'COACH',
  'BILLING',
])

export type Role = z.infer<typeof roleSchema>
