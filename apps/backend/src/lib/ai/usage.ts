import db from '@/lib/prisma'
import {
  AiModel,
  AiProvider,
  CostBreakdown,
  TrackingOptions,
  TrackingOptionsSchema,
  UsageData,
  UsageDataSchema,
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
