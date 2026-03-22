import prisma from '@/lib/prisma'
import { SubscriptionPlan } from '@prisma/client'
import { expo } from '@better-auth/expo'
import { passkey } from '@better-auth/passkey'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { organization } from 'better-auth/plugins/organization'

export const auth = betterAuth({
  basePath: '/auth',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:8000',
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  user: {
    additionalFields: {
      isAdmin: {
        type: 'boolean',
        defaultValue: false,
        returned: true,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  secret: process.env.BETTER_AUTH_SECRET as string,
  trustedOrigins: [
    'culynapp://',
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    ...(process.env.NODE_ENV === 'development'
      ? [
          'exp://*/*',
          'exp://10.0.0.*:*/*',
          'exp://192.168.*.*:*/*',
          'exp://172.*.*.*:*/*',
          'exp://localhost:*/*',
        ]
      : []),
  ],
  plugins: [expo(), passkey(), organization()],
  databaseHooks: {
    user: {
      create: {
        after: async user => {
          try {
            await prisma.$transaction(async tx => {
              const organization = await tx.organization.create({
                data: {
                  name: user.name ? `${user.name}'s Organization` : 'My Organization',
                  slug: `${user.id}-org-${Math.random().toString(36).substring(2, 8)}`,
                  ownerId: user.id,
                },
              })

              const subscription = await tx.subscription.create({
                data: {
                  plan: SubscriptionPlan.FREE,
                  status: 'ACTIVE',
                },
              })

              await tx.organization.update({
                where: { id: organization.id },
                data: { subscriptionId: subscription.id },
              })

              await tx.userOrganization.create({
                data: {
                  userId: user.id,
                  orgId: organization.id,
                  role: 'OWNER',
                },
              })

              await tx.user.update({
                where: { id: user.id },
                data: { defaultOrgId: organization.id },
              })
            })
          } catch (error) {
            if (error instanceof Error) {
              console.error(`[AUTH] Error details:`, {
                name: error.name,
                message: error.message,
                stack: error.stack,
              })
            }
          }
        },
      },
    },
  },
})
