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
import type { AdminProductItem } from '@/hooks/use-admin-products'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const PRODUCT_CATEGORIES = [
  'BEAUTY', 'TECH', 'FASHION', 'KITCHEN', 'HOME',
  'HEALTH', 'SPORTS', 'BOOKS', 'TOYS', 'OTHER',
] as const

const jsonField = z
  .string()
  .optional()
  .refine(val => {
    if (!val?.trim()) return true
    try { JSON.parse(val); return true } catch { return false }
  }, 'Invalid JSON')

const schema = z.object({
  name: z.string().optional(),
  shortName: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  price: z.string().optional(),
  currency: z.string().optional(),
  purchaseUrl: z.string().optional(),
  affiliateUrl: z.string().optional(),
  notes: z.string().optional(),
  isPublic: z.boolean().optional(),
  specifications: jsonField,
  features: jsonField,
})

type FormValues = z.infer<typeof schema>

type FullProduct = AdminProductItem & {
  description?: string | null
  purchaseUrl?: string | null
  affiliateUrl?: string | null
  notes?: string | null
  specifications?: unknown
  features?: unknown
}

interface ProductEditModalProps {
  product: FullProduct
  open: boolean
  onClose: () => void
  queryKey: unknown[]
}

export function ProductEditModal({ product, open, onClose, queryKey }: ProductEditModalProps) {
  const queryClient = useQueryClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: product.name ?? '',
        shortName: product.shortName ?? '',
        description: product.description ?? '',
        category: product.category ?? '',
        brand: product.brand ?? '',
        price: product.price != null ? String(product.price) : '',
        currency: product.currency ?? 'USD',
        purchaseUrl: product.purchaseUrl ?? '',
        affiliateUrl: product.affiliateUrl ?? '',
        notes: product.notes ?? '',
        isPublic: product.isPublic,
        specifications: product.specifications
          ? JSON.stringify(product.specifications, null, 2)
          : '',
        features: product.features ? JSON.stringify(product.features, null, 2) : '',
      })
    }
  }, [open, product, form])

  const onSubmit = async (values: FormValues) => {
    try {
      const payload: Record<string, unknown> = { ...values }
      if (values.price) payload.price = Number(values.price)
      else delete payload.price
      if (values.specifications?.trim()) payload.specifications = JSON.parse(values.specifications)
      else delete payload.specifications
      if (values.features?.trim()) payload.features = JSON.parse(values.features)
      else delete payload.features
      if (!values.category) delete payload.category

      await Api.v1.patch(`/admin/products/${product.slug}`, payload)
      await queryClient.invalidateQueries({ queryKey })
      toast.success('Product updated')
      onClose()
    } catch {
      toast.error('Failed to update product')
    }
  }

  const { register, handleSubmit, formState } = form

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
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
              <label className="text-xs font-medium">Category</label>
              <select
                {...register('category')}
                className="border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm">
                <option value="">—</option>
                {PRODUCT_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Brand</label>
              <Input {...register('brand')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">Price</label>
              <Input type="number" step="0.01" {...register('price')} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Currency</label>
              <Input {...register('currency')} placeholder="USD" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Purchase URL</label>
            <Input {...register('purchaseUrl')} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Affiliate URL</label>
            <Input {...register('affiliateUrl')} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Notes</label>
            <Textarea {...register('notes')} rows={2} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="productIsPublic" {...register('isPublic')} className="size-4" />
            <label htmlFor="productIsPublic" className="text-sm">Public</label>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Specifications (JSON)</label>
            <Textarea
              {...register('specifications')}
              placeholder="{}"
              rows={3}
              className="font-mono text-xs"
            />
            {formState.errors.specifications && (
              <p className="text-xs text-destructive">{formState.errors.specifications.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Features (JSON)</label>
            <Textarea
              {...register('features')}
              placeholder="[]"
              rows={3}
              className="font-mono text-xs"
            />
            {formState.errors.features && (
              <p className="text-xs text-destructive">{formState.errors.features.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
