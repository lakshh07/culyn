import React, { useState } from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { GroceryList } from '@/types/lists'
import { Api } from '@/lib/api'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CircleMinusIcon, LoadingIcon, TrashIcon } from '@/components/icons'
import { ClientErrorHandler } from '@/lib/errors'
import { toast } from 'sonner'

interface ShoppingListDrawerProps {
  trigger: React.ReactNode
}

export const ShoppingListDrawer = ({ trigger }: ShoppingListDrawerProps) => {
  const [open, setOpen] = useState(false)

  const { data: groceryLists } = useQuery({
    queryKey: ['v1', 'lists'],
    queryFn: async () => {
      const response = await Api.v1.get<GroceryList[]>('/lists')
      return response.data?.filter(list => !list.deletedAt)
    },
    enabled: open,
  })

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className="m-2 flex flex-col rounded-l-lg pr-1 pl-2 lg:w-full lg:max-w-lg!">
        <DrawerHeader className="shrink-0">
          <DrawerTitle>Shopping List</DrawerTitle>
          <DrawerDescription>
            {groceryLists?.length ? `${groceryLists.length} list(s)` : 'No grocery lists'}
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 space-y-8 overflow-y-auto px-4 pb-4">
          {groceryLists?.map(list => (
            <div key={list.id} className="space-y-3">
              <div className="grid grid-cols-[1fr_30px] items-center">
                <h3 className="max-w-[calc(100%-30px)] font-mono text-base font-semibold text-neutral-900">
                  {list.name}
                </h3>

                <DeleteListButton recipeSlug={list.items[0]?.recipe?.slug} listId={list.id} />
              </div>

              <div className="space-y-3">
                {list.items.map(item => (
                  <ItemCard key={item.id} item={item} />
                ))}

                {list.items.length > 0 && <ClearAllButton items={list.items} />}
              </div>
            </div>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

const DeleteListButton = ({ recipeSlug, listId }: { recipeSlug: string; listId: string }) => {
  const queryClient = useQueryClient()

  const { mutate: deleteListMutation, isPending: isDeletingList } = useMutation({
    mutationFn: async () => {
      await Api.v1.delete(`/recipes/${recipeSlug}/lists/${listId}`)
    },
    onSuccess: () => {
      toast.success('List deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['v1', 'lists'] })
    },
    onError: error => new ClientErrorHandler().toast().handle(error),
  })

  return (
    <Button
      variant={'ghost'}
      size={'icon-sm'}
      className="active:scale-95"
      onClick={() => deleteListMutation()}
      disabled={isDeletingList}>
      {isDeletingList ? (
        <LoadingIcon className="size-4 animate-spin text-neutral-500" />
      ) : (
        <TrashIcon className="text-destructive size-4" />
      )}
    </Button>
  )
}

const ClearAllButton = ({ items }: { items: GroceryList['items'] }) => {
  const queryClient = useQueryClient()

  const { mutate: clearAllMutation, isPending: isClearingAll } = useMutation({
    mutationFn: async (itemsToClear: GroceryList['items']) => {
      await Promise.all(
        itemsToClear.map(item =>
          Api.v1.patch(`/recipes/${item.recipe.slug}/items/${item.id}`, {
            clearAll: true,
          })
        )
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['v1', 'lists'] })
    },
    onError: error => new ClientErrorHandler().toast().handle(error),
  })

  return (
    <Button
      variant={'outline'}
      size={'sm'}
      className="w-full"
      onClick={() => clearAllMutation(items)}
      disabled={isClearingAll}>
      {isClearingAll ? 'Clearing...' : 'Clear All'}
    </Button>
  )
}

const ItemCard = ({ item }: { item: GroceryList['items'][number] }) => {
  const queryClient = useQueryClient()

  const { mutate: updateItemMutation, isPending: isUpdatingItem } = useMutation({
    mutationFn: async ({
      slug,
      itemId,
      checked,
      notes,
    }: {
      slug: string
      itemId: string
      checked?: boolean
      notes?: string
    }) => {
      const response = await Api.v1.patch(`/recipes/${slug}/items/${itemId}`, {
        ...(checked !== undefined && { checked }),
        ...(notes !== undefined && { notes }),
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['v1', 'lists'] })
    },
    onError: error => new ClientErrorHandler().toast().handle(error),
  })

  return (
    <div
      onClick={() =>
        updateItemMutation({
          slug: item.recipe.slug,
          itemId: item.id,
          checked: !item.checked,
        })
      }
      className="flex items-center space-x-3 rounded-lg border bg-neutral-50 p-3">
      <Avatar className="size-12 rounded-xl object-cover">
        <AvatarImage src={``} />
        <AvatarFallback className="size-full rounded-xl bg-neutral-100 object-cover">
          {item.name.charAt(0)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col">
          <p className="font-mono text-sm font-medium text-neutral-900 capitalize">{item.name}</p>
          <div className="font-mono text-sm text-neutral-500">
            {item.amount}
            <span className="ps-0.5 text-neutral-500">{item.unit}</span>
          </div>
        </div>
      </div>

      <div className="mr-2 flex shrink-0 items-center justify-end gap-6">
        {isUpdatingItem ? (
          <LoadingIcon className="size-4 animate-spin cursor-not-allowed text-neutral-500" />
        ) : (
          <Checkbox checked={item.checked} disabled={isUpdatingItem} className="h-5 w-5" />
        )}

        <Button
          variant={'ghost'}
          size={'icon-sm'}
          className="active:scale-95"
          onClick={e => {
            e.stopPropagation()
            e.preventDefault()

            updateItemMutation({
              slug: item.recipe.slug,
              itemId: item.id,
            })
          }}>
          <CircleMinusIcon className="size-4.5 text-neutral-500" />
        </Button>
      </div>
    </div>
  )
}
