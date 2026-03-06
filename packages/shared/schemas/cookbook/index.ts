import z from 'zod'

export const CookbookItemSchema = z.object({
  id: z.string(),
  recipe: z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    shortTitle: z.string(),
    imageUrl: z.string(),
    sourceName: z.string(),
    calories: z.number(),
    cookTime: z.number(),
    metadata: z.object({
      jobId: z.string(),
    }),
  }),
})

export type CookbookItem = z.infer<typeof CookbookItemSchema>
