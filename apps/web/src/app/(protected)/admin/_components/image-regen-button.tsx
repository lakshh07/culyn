'use client'

import { Button } from '@/components/ui/button'
import { Api } from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'
import { RefreshCwIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

type RegenState = 'idle' | 'loading' | 'success' | 'error'

interface ImageRegenButtonProps {
  entityType: 'recipes' | 'places' | 'products'
  slug: string
  queryKey: unknown[]
}

export function ImageRegenButton({ entityType, slug, queryKey }: ImageRegenButtonProps) {
  const [state, setState] = useState<RegenState>('idle')
  const queryClient = useQueryClient()

  const handleRegen = async () => {
    setState('loading')
    try {
      await Api.v1.post(`/admin/${entityType}/${slug}/image/regenerate`)
      setState('success')
      await queryClient.invalidateQueries({ queryKey })
      toast.success('Image regenerated successfully')
      setTimeout(() => setState('idle'), 2000)
    } catch {
      setState('error')
      toast.error('Failed to regenerate image')
      setTimeout(() => setState('idle'), 3000)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={handleRegen}
      disabled={state === 'loading'}
      title="Regenerate image"
      className={
        state === 'success'
          ? 'text-green-600'
          : state === 'error'
            ? 'text-destructive'
            : 'text-muted-foreground'
      }>
      <RefreshCwIcon className={state === 'loading' ? 'animate-spin' : ''} />
    </Button>
  )
}
