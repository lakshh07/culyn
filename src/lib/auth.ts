import { betterAuth } from 'better-auth'
import prisma from '@/lib/prisma'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { passkey } from 'better-auth/plugins/passkey'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  secret: process.env.BETTER_AUTH_SECRET as string,
  plugins: [passkey()],
})
