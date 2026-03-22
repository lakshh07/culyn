'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Api } from '@/lib/api'
import type { AdminPlaceItem } from '@/hooks/use-admin-places'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const PLACE_TYPES = [
  'RESTAURANT',
  'CAFE',
  'BAR',
  'BAKERY',
  'FOOD_TRUCK',
  'MARKET',
  'GROCERY_STORE',
  'SPECIALTY_SHOP',
  'OTHER',
] as const

const jsonField = z
  .string()
  .optional()
  .refine(val => {
    if (!val?.trim()) return true
    try {
      JSON.parse(val)
      return true
    } catch {
      return false
    }
  }, 'Invalid JSON')

const schema = z.object({
  name: z.string().optional(),
  shortName: z.string().optional(),
  description: z.string().optional(),
  type: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  phoneNumber: z.string().optional(),
  website: z.string().optional(),
  priceRange: z.string().optional(),
  cuisine: z.string().optional(),
  rating: z.string().optional(),
  notes: z.string().optional(),
  isPublic: z.boolean().optional(),
  hours: jsonField,
})

type FormValues = z.infer<typeof schema>

type FullPlace = AdminPlaceItem & {
  description?: string | null
  address?: string | null
  state?: string | null
  country?: string | null
  phoneNumber?: string | null
  website?: string | null
  notes?: string | null
  hours?: unknown
}

interface PlaceEditModalProps {
  place: FullPlace
  open: boolean
  onClose: () => void
  queryKey: unknown[]
}

export function PlaceEditModal({ place, open, onClose, queryKey }: PlaceEditModalProps) {
  const queryClient = useQueryClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: place.name ?? '',
        shortName: place.shortName ?? '',
        description: place.description ?? '',
        type: place.type ?? '',
        address: place.address ?? '',
        city: place.city ?? '',
        state: place.state ?? '',
        country: place.country ?? '',
        phoneNumber: place.phoneNumber ?? '',
        website: place.website ?? '',
        priceRange: place.priceRange ?? '',
        cuisine: place.cuisine ?? '',
        rating: place.rating != null ? String(place.rating) : '',
        notes: place.notes ?? '',
        isPublic: place.isPublic,
        hours: place.hours ? JSON.stringify(place.hours, null, 2) : '',
      })
    }
  }, [open, place, form])

  const onSubmit = async (values: FormValues) => {
    try {
      const payload: Record<string, unknown> = { ...values }
      if (values.rating) payload.rating = Number(values.rating)
      else delete payload.rating
      if (values.hours?.trim()) payload.hours = JSON.parse(values.hours)
      else delete payload.hours
      if (!values.type) delete payload.type

      await Api.v1.patch(`/admin/places/${place.slug}`, payload)
      await queryClient.invalidateQueries({ queryKey })
      toast.success('Place updated')
      onClose()
    } catch {
      toast.error('Failed to update place')
    }
  }

  const { register, handleSubmit, formState } = form

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Place</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">Name</label>
              <Input {...register('name')} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Short Name</label>
              <Input {...register('shortName')} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Description</label>
            <Textarea {...register('description')} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">Type</label>
              <select
                {...register('type')}
                className="border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm">
                <option value="">—</option>
                {PLACE_TYPES.map(t => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Cuisine</label>
              <Input {...register('cuisine')} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Address</label>
            <Input {...register('address')} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">City</label>
              <Input {...register('city')} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">State</label>
              <Input {...register('state')} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Country</label>
              <Input {...register('country')} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">Phone</label>
              <Input {...register('phoneNumber')} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Price Range</label>
              <Input {...register('priceRange')} placeholder="$, $$, $$$" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Rating (0–5)</label>
              <Input type="number" step="0.1" min="0" max="5" {...register('rating')} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Website</label>
            <Input {...register('website')} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Notes</label>
            <Textarea {...register('notes')} rows={2} />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="placeIsPublic"
              {...register('isPublic')}
              className="size-4"
            />
            <label htmlFor="placeIsPublic" className="text-sm">
              Public
            </label>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Hours (JSON)</label>
            <Textarea
              {...register('hours')}
              placeholder="{}"
              rows={3}
              className="font-mono text-xs"
            />
            {formState.errors.hours && (
              <p className="text-destructive text-xs">{formState.errors.hours.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
