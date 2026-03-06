export interface Ingredient {
  id: string
  slug: string
  name: string
  category?: string | null
}

export interface Tag {
  id: string
  slug: string
  name: string
  type: string
}
