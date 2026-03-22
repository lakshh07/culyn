'use client'

import { useAdminPlaces, type AdminPlaceItem } from '@/hooks/use-admin-places'
import { AdminTable } from '../_components/admin-table'
import { ImageRegenButton } from '../_components/image-regen-button'
import { PlaceEditModal } from '../_components/place-edit-modal'
import { PencilIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

const HEADERS = ['', 'Name', 'Type', 'City', 'Cuisine', 'Public', 'Created', 'Actions']

export default function AdminPlacesPage() {
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<AdminPlaceItem | null>(null)

  const { data, isLoading } = useAdminPlaces(page, q || undefined)
  const queryKey = ['admin', 'places', page, q || undefined]
  const totalPages = data ? Math.ceil(data.total / data.limit) : 1

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setQ(search)
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Places</h1>
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
          {data?.items.map(place => (
            <tr key={place.id} className="hover:bg-muted/30">
              <td className="px-4 py-2">
                {place.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={place.imageUrl}
                    alt={place.name ?? ''}
                    className="size-10 rounded object-cover"
                  />
                ) : (
                  <div className="bg-muted size-10 rounded" />
                )}
              </td>
              <td className="px-4 py-2">
                <div className="text-sm font-medium">{place.name ?? '—'}</div>
                {place.shortName && (
                  <div className="text-muted-foreground text-xs">{place.shortName}</div>
                )}
              </td>
              <td className="text-muted-foreground px-4 py-2 text-sm">
                {place.type.replace(/_/g, ' ')}
              </td>
              <td className="text-muted-foreground px-4 py-2 text-sm">{place.city ?? '—'}</td>
              <td className="text-muted-foreground px-4 py-2 text-sm">{place.cuisine ?? '—'}</td>
              <td className="px-4 py-2">
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs ${
                    place.isPublic
                      ? 'bg-green-100 text-green-700'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                  {place.isPublic ? 'Public' : 'Private'}
                </span>
              </td>
              <td className="text-muted-foreground px-4 py-2 text-xs">
                {new Date(place.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-2">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setEditing(place)}
                    title="Edit">
                    <PencilIcon className="text-muted-foreground" />
                  </Button>
                  <ImageRegenButton entityType="places" slug={place.slug} queryKey={queryKey} />
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      {editing && (
        <PlaceEditModal
          place={editing}
          open={!!editing}
          onClose={() => setEditing(null)}
          queryKey={queryKey}
        />
      )}
    </div>
  )
}
