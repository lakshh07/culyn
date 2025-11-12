export type GroceryList = {
  id: string
  name: string
  description: string
  completed: boolean
  deletedAt: Date | null
  items: {
    id: string
    name: string
    amount: string
    unit: string
    checked: boolean
    notes: string
    ingredientId: string
    deletedAt: Date | null
    recipe: {
      slug: string
    }
  }[]
}
