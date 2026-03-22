'use client'

import { Api } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import type { AdminListResponse } from './use-admin-recipes'

export interface AdminProductItem {
  id: string
  slug: string
  name: string | null
  shortName: string | null
  imageUrl: string | null
  category: string
  brand: string | null
  price: number | null
  currency: string | null
  isPublic: boolean
  createdAt: string
}

export function useAdminProducts(page: number, q?: string) {
  return useQuery({
    queryKey: ['admin', 'products', page, q],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (q) params.set('q', q)
      const response = await Api.v1.get<AdminListResponse<AdminProductItem>>(
        `/admin/products?${params}`
      )
      return response.data
    },
  })
}
