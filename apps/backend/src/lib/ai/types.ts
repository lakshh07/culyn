import { z } from 'zod'
import { AiPricing } from './usage'

export enum AiProvider {
  Google = 'google',
  OpenAI = 'openai',
}

type GoogleModels = keyof (typeof AiPricing)[AiProvider.Google]
type OpenAIModels = keyof (typeof AiPricing)[AiProvider.OpenAI]

export type AiModel = GoogleModels | OpenAIModels

export const UsageDataSchema = z.object({
  input_tokens: z.number().nonnegative(),
  output_tokens: z.number().nonnegative(),
})

export const TrackingOptionsSchema = z.object({
  provider: z.nativeEnum(AiProvider),
  model: z.string(),
  feature: z.string().min(1),
  initiator: z.string().min(1),
  user_id: z.string().min(1),
  recipe_id: z.string().optional(),
  place_id: z.string().optional(),
  product_id: z.string().optional(),
})

export type UsageData = z.infer<typeof UsageDataSchema>
export type TokenUsage = UsageData

export type TrackingOptions = z.infer<typeof TrackingOptionsSchema>

export type CostBreakdown = {
  inputCost: number
  outputCost: number
  totalCost: number
}
