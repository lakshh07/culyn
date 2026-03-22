'use client'

import { useAdminRecipes, type AdminRecipeItem } from '@/hooks/use-admin-recipes'
import { AdminTable } from '../_components/admin-table'
import { ImageRegenButton } from '../_components/image-regen-button'
import { RecipeEditModal } from '../_components/recipe-edit-modal'
import { PencilIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

const HEADERS = ['', 'Title', 'Cook Time', 'Difficulty', 'Public', 'Created', 'Actions']

export default function AdminRecipesPage() {
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<AdminRecipeItem | null>(null)

  const { data, isLoading } = useAdminRecipes(page, q || undefined)
  const queryKey = ['admin', 'recipes', page, q || undefined]
  const totalPages = data ? Math.ceil(data.total / data.limit) : 1

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setQ(search)
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Recipes</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search…"
            className="w-48"
          />
          <Button type="submit" variant="outline" size="sm">
            Search
          </Button>
        </form>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : (
        <AdminTable
          headers={HEADERS}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          total={data?.total ?? 0}>
          {data?.items.map(recipe => (
            <tr key={recipe.id} className="hover:bg-muted/30">
              <td className="px-4 py-2">
                {recipe.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.title ?? ''}
                    className="size-10 rounded object-cover"
                  />
                ) : (
                  <div className="bg-muted size-10 rounded" />
                )}
              </td>
              <td className="px-4 py-2">
                <div className="text-sm font-medium">{recipe.title ?? '—'}</div>
                {recipe.shortTitle && (
                  <div className="text-muted-foreground text-xs">{recipe.shortTitle}</div>
                )}
              </td>
              <td className="text-muted-foreground px-4 py-2 text-sm">
                {recipe.cookTime ? `${recipe.cookTime}m` : '—'}
              </td>
              <td className="text-muted-foreground px-4 py-2 text-sm">
                {recipe.difficulty ?? '—'}
              </td>
              <td className="px-4 py-2">
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs ${
                    recipe.isPublic
                      ? 'bg-green-100 text-green-700'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                  {recipe.isPublic ? 'Public' : 'Private'}
                </span>
              </td>
              <td className="text-muted-foreground px-4 py-2 text-xs">
                {new Date(recipe.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-2">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setEditing(recipe)}
                    title="Edit">
                    <PencilIcon className="text-muted-foreground" />
                  </Button>
                  <ImageRegenButton entityType="recipes" slug={recipe.slug} queryKey={queryKey} />
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      {editing && (
        <RecipeEditModal
          recipe={editing}
          open={!!editing}
          onClose={() => setEditing(null)}
          queryKey={queryKey}
        />
      )}
    </div>
  )
}
