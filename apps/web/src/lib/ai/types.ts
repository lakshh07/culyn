import { z } from 'zod'

export enum AiProvider {
  Google = 'google',
}

export const UsageDataSchema = z.object({
  input_tokens: z.number().nonnegative(),
  output_tokens: z.number().nonnegative(),
})

export const TrackingOptionsSchema = z.object({
  provider: z.enum(AiProvider),
  model: z.string(),
  feature: z.string().min(1),
  initiator: z.string().min(1),
  user_id: z.string().min(1),
  recipe_id: z.string().optional(),
})

export type UsageData = z.infer<typeof UsageDataSchema>
export type TokenUsage = UsageData

export type TrackingOptions = z.infer<typeof TrackingOptionsSchema>

export type CostBreakdown = {
  inputCost: number
  outputCost: number
  totalCost: number
}

export type UserCostSummary = {
  userId: string
  totalCost: number
  totalRequests: number
  inputTokens: number
  outputTokens: number
  byProvider: Record<
    string,
    {
      cost: number
      requests: number
      inputTokens: number
      outputTokens: number
      byModel: Record<string, { cost: number; requests: number }>
    }
  >
}

export type CostAggregationPeriod = 'day' | 'week' | 'month' | 'year' | 'all'
