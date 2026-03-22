'use client'

import { Api } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import type { AdminListResponse } from './use-admin-recipes'

export interface AdminPlaceItem {
  id: string
  slug: string
  name: string | null
  shortName: string | null
  imageUrl: string | null
  type: string
  city: string | null
  cuisine: string | null
  isPublic: boolean
  createdAt: string
  priceRange: string | null
  rating: number | null
}

export function useAdminPlaces(page: number, q?: string) {
  return useQuery({
    queryKey: ['admin', 'places', page, q],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (q) params.set('q', q)
      const response = await Api.v1.get<AdminListResponse<AdminPlaceItem>>(
        `/admin/places?${params}`
      )
      return response.data
    },
  })
}
