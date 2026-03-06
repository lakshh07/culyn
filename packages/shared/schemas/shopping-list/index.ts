import z from 'zod'

export const ListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.string(),
  unit: z.string(),
  checked: z.boolean(),
  notes: z.string(),
  ingredientId: z.string(),
  deletedAt: z.date().nullable(),
  recipe: z.object({
    slug: z.string(),
    servings: z.number(),
  }),
})

export const ShoppingListSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  completed: z.boolean(),
  deletedAt: z.date().nullable(),
  items: z.array(ListItemSchema),
})

export type ListItem = z.infer<typeof ListItemSchema>
export type ShoppingList = z.infer<typeof ShoppingListSchema>
