import { LoadingIcon, PlaylistAddIcon } from '@/components/icons'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Api } from '@/lib/api'
import { ClientErrorHandler } from '@/lib/errors'
import { getIngredientImageUrl } from '@/lib/recipe/ingredient-assets'
import { cn } from '@/lib/utils'
import { GroceryList } from '@/types/lists'
import NumberFlow from '@number-flow/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useMediaQuery } from 'usehooks-ts'

type scaledIngredients = {
  scaledAmount: string
  ingredient: {
    id: string
    name: string
    slug: string
  }
  amount: string
  unit: string
}

type CreateShoppingListProps = {
  scaledIngredients: scaledIngredients[]
  recipeId: string
  recipeSlug: string
}

export const CreateShoppingList = ({
  scaledIngredients,
  recipeId,
  recipeSlug,
}: CreateShoppingListProps) => {
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(() => new Set())
  const [shoppingListDialogOpen, setShoppingListDialogOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const queryClient = useQueryClient()

  const { data: groceryLists } = useQuery({
    queryKey: ['v1', 'lists', recipeId],
    queryFn: async () => {
      const response = await Api.v1.get<GroceryList[]>(`/lists?recipeId=${recipeId}`)
      return response.data
    },
    enabled: !!recipeId,
  })

  const { mutate: addToGroceryList, isPending: isAddingToGroceryList } = useMutation({
    mutationFn: async () => {
      await Api.v1.post('/lists', {
        recipeSlug,
        ingredientIds: Array.from(selectedIngredients),
        ...(groceryLists?.[0]?.id && { groceryListId: groceryLists?.[0]?.id }),
      })
    },
    onSuccess: () => {
      toast.success('Ingredients added to grocery list')
      queryClient.invalidateQueries({ queryKey: ['v1', 'lists'] })
      resetToDefaults()
      setShoppingListDialogOpen(false)
    },
    onError: error => {
      new ClientErrorHandler().toast().handle(error)
    },
  })

  const getDefaultSelectedIngredients = () => {
    if (!groceryLists) return new Set<string>()
    return new Set(groceryLists.map(list => list.items.map(item => item.ingredientId)).flat())
  }

  const resetToDefaults = () => {
    setSelectedIngredients(getDefaultSelectedIngredients())
  }

  useEffect(() => {
    if (groceryLists) {
      setSelectedIngredients(getDefaultSelectedIngredients())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groceryLists])

  if (isDesktop) {
    return (
      <Dialog
        open={shoppingListDialogOpen}
        onOpenChange={open => {
          if (!open) {
            resetToDefaults()
          }
          setShoppingListDialogOpen(open)
        }}>
        <DialogTrigger asChild>
          <Button variant={'ghost'} size={'sm'} className="text-xs active:scale-95 lg:text-sm">
            <PlaylistAddIcon className="size-3.5 lg:size-4" />
            Add to list
          </Button>
        </DialogTrigger>
        <DialogContent showCloseButton={false} className="max-w-xl sm:max-w-2xl lg:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="sm:text-base sm:leading-none lg:text-lg">
              Add to Shopping List
            </DialogTitle>
            <DialogDescription className="text-xs lg:text-sm">
              Select ingredients from this recipe to add to your shopping list for easy grocery
              planning.
            </DialogDescription>

            <div className="mt-6 grid max-h-[65vh] grid-cols-2 gap-x-2 gap-y-2 overflow-y-auto sm:max-h-[50vh]">
              {scaledIngredients.map(ri => (
                <div
                  className={cn(
                    'mr-4 flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-transparent px-4 py-2 transition-all duration-300 hover:border-neutral-700',
                    selectedIngredients.has(ri.ingredient.id) && 'border-neutral-700 bg-neutral-100'
                  )}
                  key={ri.ingredient.id}
                  onClick={() =>
                    setSelectedIngredients(prev => {
                      const next = new Set(prev)
                      if (next.has(ri.ingredient.id)) {
                        next.delete(ri.ingredient.id)
                      } else {
                        next.add(ri.ingredient.id)
                      }
                      return next
                    })
                  }>
                  <div className="relative flex items-center gap-2">
                    <Avatar className="size-12 rounded-xl object-cover">
                      <AvatarImage src={getIngredientImageUrl(ri.ingredient.name)} />
                      <AvatarFallback className="size-full rounded-xl bg-amber-100 object-cover">
                        {ri.ingredient.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <p className="font-mono text-sm font-medium text-neutral-900 capitalize">
                        {ri.ingredient.name}
                      </p>
                      <div className="font-mono text-sm text-neutral-500">
                        {ri.scaledAmount && (
                          <NumberFlow
                            value={Number(ri.scaledAmount)}
                            className="font-mono text-sm"
                          />
                        )}
                        <span className="ps-0.5 text-neutral-500">{ri.unit}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <Checkbox
                      id={`add-to-list-${ri.ingredient.id}`}
                      checked={selectedIngredients.has(ri.ingredient.id)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button
                  variant={'outline'}
                  size={'sm'}
                  className="active:scale-95"
                  disabled={isAddingToGroceryList}>
                  Cancel
                </Button>
              </DialogClose>

              <Button
                variant={'default'}
                size={'sm'}
                className="w-22 active:scale-95"
                disabled={
                  (!groceryLists?.[0]?.id && selectedIngredients.size === 0) ||
                  isAddingToGroceryList
                }
                onClick={() => addToGroceryList()}>
                {isAddingToGroceryList ? (
                  <LoadingIcon className="size-4 animate-spin" />
                ) : !groceryLists?.[0]?.id ? (
                  'Add'
                ) : (
                  'Update'
                )}
              </Button>
            </DialogFooter>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer direction="bottom">
      <DrawerTrigger asChild>
        <Button variant={'ghost'} size={'sm'} className="text-xs active:scale-95 lg:text-sm">
          <PlaylistAddIcon className="size-3.5 lg:size-4" />
          Add to list
        </Button>
      </DrawerTrigger>

      <DrawerContent className="flex flex-col data-[vaul-drawer-direction=bottom]:max-h-[90vh]">
        <DrawerHeader className="shrink-0">
          <DrawerTitle className="text-left">Add to Shopping List</DrawerTitle>
          <DrawerDescription className="text-left">
            Select ingredients from this recipe to add to your shopping list for easy grocery
            planning.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4">
          <div className="grid grid-cols-1 gap-x-2 gap-y-2">
            {scaledIngredients.map(ri => (
              <div
                className={cn(
                  'mr-4 flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-transparent py-2 pr-4 pl-2 transition-all duration-300 hover:border-neutral-700',
                  selectedIngredients.has(ri.ingredient.id) && 'border-neutral-700 bg-neutral-100'
                )}
                key={ri.ingredient.id}
                onClick={() =>
                  setSelectedIngredients(prev => {
                    const next = new Set(prev)
                    if (next.has(ri.ingredient.id)) {
                      next.delete(ri.ingredient.id)
                    } else {
                      next.add(ri.ingredient.id)
                    }
                    return next
                  })
                }>
                <div className="relative flex items-center gap-2">
                  <Avatar className="size-12 rounded-xl object-cover">
                    <AvatarImage src={getIngredientImageUrl(ri.ingredient.name)} />
                    <AvatarFallback className="size-full rounded-xl bg-amber-100 object-cover">
                      {ri.ingredient.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="text-left">
                    <p className="font-mono text-sm font-medium text-neutral-900 capitalize">
                      {ri.ingredient.name}
                    </p>
                    <div className="font-mono text-sm text-neutral-500">
                      {ri.scaledAmount && (
                        <NumberFlow value={Number(ri.scaledAmount)} className="font-mono text-sm" />
                      )}
                      <span className="ps-0.5 text-neutral-500">{ri.unit}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <Checkbox
                    id={`add-to-list-${ri.ingredient.id}`}
                    checked={selectedIngredients.has(ri.ingredient.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <DrawerFooter className="shrink-0">
          <Button
            variant={'default'}
            size={'sm'}
            className="w-full active:scale-95"
            disabled={
              (!groceryLists?.[0]?.id && selectedIngredients.size === 0) || isAddingToGroceryList
            }
            onClick={() => addToGroceryList()}>
            {isAddingToGroceryList ? (
              <LoadingIcon className="size-4 animate-spin" />
            ) : !groceryLists?.[0]?.id ? (
              'Add'
            ) : (
              'Update'
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
