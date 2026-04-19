import prisma from '@/lib/prisma'
import { SubscriptionPlan } from '@prisma/client'
import { expo } from '@better-auth/expo'
import { passkey } from '@better-auth/passkey'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { organization } from 'better-auth/plugins/organization'
import { importPKCS8, SignJWT } from 'jose'

async function generateAppleClientSecret() {
  const privateKey = process.env.APPLE_PRIVATE_KEY!.replace(/\\n/g, '\n')
  const key = await importPKCS8(privateKey, 'ES256')
  const now = Math.floor(Date.now() / 1000)
  return new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: process.env.APPLE_KEY_ID! })
    .setIssuer(process.env.APPLE_TEAM_ID!)
    .setSubject(process.env.APPLE_SERVICE_ID!)
    .setAudience('https://appleid.apple.com')
    .setIssuedAt(now)
    .setExpirationTime(now + 180 * 24 * 60 * 60)
    .sign(key)
}

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
    apple: {
      clientId: process.env.APPLE_SERVICE_ID as string,
      clientSecret: await generateAppleClientSecret(),
      appBundleIdentifier: 'com.culyn-ai',
    },
  },
  secret: process.env.BETTER_AUTH_SECRET as string,
  trustedOrigins: [
    'culynapp://',
    'https://appleid.apple.com',
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
