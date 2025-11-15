import db from '@/lib/prisma'
import {
  AiModel,
  AiProvider,
  CostAggregationPeriod,
  CostBreakdown,
  TrackingOptions,
  TrackingOptionsSchema,
  UsageData,
  UsageDataSchema,
  UserCostSummary,
} from './types'

/**
 * Pricing configuration for AI providers.
 * Prices are in USD per unit (typically per 1M tokens).
 */
export const AiPricing = Object.freeze({
  [AiProvider.Google]: {
    'gemini-2.5-flash': { input: 0.3, output: 2.5, unit: 1_000_000 },
    'gemini-2.5-flash-image': { input: 0.3, output: 30, unit: 1_000_000 },
  },
} as const)

/**
 * Calculate cost from a usage record.
 *
 * @param usage - The usage record from the database
 * @returns Cost breakdown
 */
export function calculateCostFromUsage(usage: {
  provider: string
  model: string
  inputTokens: number
  outputTokens: number
}): CostBreakdown {
  const pricing = AiPricing[usage.provider as AiProvider]?.[usage.model as AiModel]

  if (!pricing) {
    console.warn(
      `[AI Usage] No pricing found for ${usage.provider}:${usage.model}, defaulting to $0`
    )
    return { inputCost: 0, outputCost: 0, totalCost: 0 }
  }

  const inputCost = (usage.inputTokens / pricing.unit) * pricing.input
  const outputCost = (usage.outputTokens / pricing.unit) * pricing.output
  const totalCost = inputCost + outputCost

  return {
    inputCost: Number(inputCost.toFixed(6)),
    outputCost: Number(outputCost.toFixed(6)),
    totalCost: Number(totalCost.toFixed(6)),
  }
}

/**
 * Tracks AI usage by creating a record in the database.
 *
 * @param counts - The usage data (input/output tokens)
 * @param options - Additional tracking options (provider, model, user, etc.)
 * @throws Will log errors but not throw to prevent disrupting application flow
 */
export async function trackAiUsage(counts: UsageData, options: TrackingOptions): Promise<void> {
  try {
    const validatedCounts = UsageDataSchema.parse(counts)
    const validatedOptions = TrackingOptionsSchema.parse(options)

    await db.aiUsage.create({
      data: {
        inputTokens: validatedCounts.input_tokens,
        outputTokens: validatedCounts.output_tokens,
        provider: validatedOptions.provider,
        model: validatedOptions.model,
        feature: validatedOptions.feature,
        initiator: validatedOptions.initiator,
        userId: validatedOptions.user_id,
        recipeId: validatedOptions.recipe_id,
      },
    })
  } catch (error) {
    console.error('[AI Usage] Failed to track usage:', error)
  }
}

/**
 * Wraps a promise and tracks AI usage when it resolves.
 *
 * @param promise - The promise to wrap
 * @param usage - A callback that receives the resolved data and returns usage info
 * @param options - Additional tracking options
 * @returns The resolved value of the original promise
 *
 * @example
 * ```ts
 * const result = await withAiUsageTracking(
 *   generateObject({ model: google('gemini-2.5-flash'), ... }),
 *   async (data) => ({
 *     input_tokens: data.usage.promptTokens,
 *     output_tokens: data.usage.completionTokens,
 *   }),
 *   {
 *     provider: AiProvider.Google,
 *     model: 'gemini-2.5-flash',
 *     feature: 'recipe:generate',
 *     initiator: 'api:generate-recipe',
 *     user_id: userId,
 *     recipe_id: recipeId,
 *   }
 * )
 * ```
 */
export async function withAiUsageTracking<T>(
  promise: Promise<T>,
  usage: (data: T) => Promise<UsageData> | UsageData,
  options: TrackingOptions
): Promise<T> {
  const result = await promise

  Promise.resolve()
    .then(async () => {
      const counts = await usage(result)
      await trackAiUsage(counts, options)
    })
    .catch(error => {
      console.error('[AI Usage] Failed to track usage in background:', error)
    })

  return result
}

/**
 * Get the total cost for a user over a specific time period.
 *
 * @param userId - The user ID
 * @param period - The time period to aggregate ('day', 'week', 'month', 'year', 'all')
 * @returns Total cost in USD
 */
export async function getUserCost(
  userId: string,
  period: CostAggregationPeriod = 'all'
): Promise<number> {
  const whereClause = buildDateWhereClause(userId, period)

  const usages = await db.aiUsage.findMany({
    where: whereClause,
    select: {
      provider: true,
      model: true,
      inputTokens: true,
      outputTokens: true,
    },
  })

  let totalCost = 0
  for (const usage of usages) {
    const cost = calculateCostFromUsage(usage)
    totalCost += cost.totalCost
  }

  return Number(totalCost.toFixed(6))
}

/**
 * Get a detailed cost summary for a user.
 *
 * @param userId - The user ID
 * @param period - The time period to aggregate
 * @returns Detailed cost breakdown by provider and model
 */
export async function getUserCostSummary(
  userId: string,
  period: CostAggregationPeriod = 'all'
): Promise<UserCostSummary> {
  const whereClause = buildDateWhereClause(userId, period)

  const usages = await db.aiUsage.findMany({
    where: whereClause,
    select: {
      provider: true,
      model: true,
      inputTokens: true,
      outputTokens: true,
    },
  })

  const summary: UserCostSummary = {
    userId,
    totalCost: 0,
    totalRequests: usages.length,
    inputTokens: 0,
    outputTokens: 0,
    byProvider: {},
  }

  for (const usage of usages) {
    const cost = calculateCostFromUsage(usage)
    summary.totalCost += cost.totalCost
    summary.inputTokens += usage.inputTokens
    summary.outputTokens += usage.outputTokens

    // Initialize provider if not exists
    if (!summary.byProvider[usage.provider]) {
      summary.byProvider[usage.provider] = {
        cost: 0,
        requests: 0,
        inputTokens: 0,
        outputTokens: 0,
        byModel: {},
      }
    }

    const providerData = summary.byProvider[usage.provider]
    providerData.cost += cost.totalCost
    providerData.requests++
    providerData.inputTokens += usage.inputTokens
    providerData.outputTokens += usage.outputTokens

    // Initialize model if not exists
    if (!providerData.byModel[usage.model]) {
      providerData.byModel[usage.model] = {
        cost: 0,
        requests: 0,
      }
    }

    providerData.byModel[usage.model].cost += cost.totalCost
    providerData.byModel[usage.model].requests++
  }

  // Round final totals
  summary.totalCost = Number(summary.totalCost.toFixed(6))
  for (const provider of Object.keys(summary.byProvider)) {
    summary.byProvider[provider].cost = Number(summary.byProvider[provider].cost.toFixed(6))
    for (const model of Object.keys(summary.byProvider[provider].byModel)) {
      summary.byProvider[provider].byModel[model].cost = Number(
        summary.byProvider[provider].byModel[model].cost.toFixed(6)
      )
    }
  }

  return summary
}

/**
 * Get cost summaries for multiple users.
 *
 * @param userIds - Array of user IDs
 * @param period - The time period to aggregate
 * @returns Array of user cost summaries
 */
export async function getBatchUserCosts(
  userIds: string[],
  period: CostAggregationPeriod = 'all'
): Promise<UserCostSummary[]> {
  return Promise.all(userIds.map(userId => getUserCostSummary(userId, period)))
}

/**
 * Get the top N users by cost.
 *
 * @param limit - Number of users to return
 * @param period - The time period to aggregate
 * @returns Array of user cost summaries sorted by cost (descending)
 */
export async function getTopUsersByCost(
  limit: number = 10,
  period: CostAggregationPeriod = 'all'
): Promise<UserCostSummary[]> {
  const whereClause = buildDateWhereClause(undefined, period)

  // Get distinct user IDs
  const users = await db.aiUsage.findMany({
    where: whereClause,
    select: { userId: true },
    distinct: ['userId'],
  })

  const userIds = users.map(u => u.userId)
  const summaries = await getBatchUserCosts(userIds, period)

  return summaries.sort((a, b) => b.totalCost - a.totalCost).slice(0, limit)
}

/**
 * Build a where clause for date-based queries.
 */
function buildDateWhereClause(userId: string | undefined, period: CostAggregationPeriod) {
  const now = new Date()
  let startDate: Date | undefined

  switch (period) {
    case 'day':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case 'week':
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 7)
      break
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1)
      break
    case 'all':
      startDate = undefined
      break
  }

  return {
    ...(userId && { userId }),
    ...(startDate && {
      createdAt: {
        gte: startDate,
      },
    }),
  }
}
