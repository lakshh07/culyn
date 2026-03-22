'use client'

import { Api } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'

export interface AdminRecipeItem {
  id: string
  slug: string
  title: string | null
  shortTitle: string | null
  imageUrl: string | null
  cookTime: number | null
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | null
  isPublic: boolean
  createdAt: string
  calories: number | null
  servings: number | null
}

export interface AdminListResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export function useAdminRecipes(page: number, q?: string) {
  return useQuery({
    queryKey: ['admin', 'recipes', page, q],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (q) params.set('q', q)
      const response = await Api.v1.get<AdminListResponse<AdminRecipeItem>>(
        `/admin/recipes?${params}`
      )
      return response.data
    },
  })
}
