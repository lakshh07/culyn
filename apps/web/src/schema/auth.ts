import { z } from 'zod'

export const signInSchema = z.object({
  email: z.email('Invalid email'),
  password: z.string().min(8, 'Min 8 chars'),
})

export const signUpSchema = z
  .object({
    name: z.string().min(2, 'Min 2 chars'),
    email: z.email(),
    password: z.string().min(8, 'Min 8 chars'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
