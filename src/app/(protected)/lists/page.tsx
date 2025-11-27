'use client'

import { GroceryList } from '@/types/lists'
import { useQuery } from '@tanstack/react-query'
import { AnimatedShoppingList } from '@/components/sections/lists/animated-shopping-list'
import { Api } from '@/lib/api'

export default function ListsPage() {
  const { data: groceryLists } = useQuery({
    queryKey: ['v1', 'lists'],
    queryFn: async () => {
      const response = await Api.v1.get<GroceryList[]>('/lists')
      return response.data?.filter(list => !list.deletedAt)
    },
  })

  return (
    <section className="max-w-8xl mx-auto min-h-screen px-3 sm:px-4">
      <div className="relative top-24 space-y-16 py-16">
        <div className="space-y-16">
          <div className="space-y-2 font-mono text-sm font-bold text-neutral-950 sm:space-y-1 sm:text-center sm:text-xl lg:space-y-1.5 lg:text-2xl xl:space-y-2 xl:text-3xl">
            <div className="flex flex-col items-start justify-center sm:flex-row sm:items-center sm:gap-1.5 lg:gap-2">
              <h1>Shopping List</h1>
            </div>
            <p className="text-neutral-500">Manage your shopping list here.</p>
          </div>
        </div>

        {groceryLists ? <AnimatedShoppingList groceryLists={groceryLists} /> : null}
      </div>
    </section>
  )
}
