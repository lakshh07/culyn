import { SubscriptionPlan } from '@prisma/client'

export interface PlanLimits {
  maxImports: number // combined library items cap; -1 = unlimited
  maxUsers: number // -1 = unlimited
  maxLists: number // -1 = unlimited
  aiCreditsLimit: number // -1 = unlimited
}

export const PLAN_DEFAULTS: Record<SubscriptionPlan, PlanLimits> = {
  [SubscriptionPlan.FREE]: {
    maxImports: 12,
    maxUsers: 1,
    maxLists: 5,
    aiCreditsLimit: 100,
  },
  [SubscriptionPlan.BASIC]: {
    maxImports: 50,
    maxUsers: 3,
    maxLists: 20,
    aiCreditsLimit: 500,
  },
  [SubscriptionPlan.PRO]: {
    maxImports: -1,
    maxUsers: -1,
    maxLists: -1,
    aiCreditsLimit: -1,
  },
  [SubscriptionPlan.ENTERPRISE]: {
    maxImports: -1,
    maxUsers: -1,
    maxLists: -1,
    aiCreditsLimit: -1,
  },
}
