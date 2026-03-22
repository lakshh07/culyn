import { Button } from '@/components/ui/button'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

interface AdminTableProps {
  headers: string[]
  children: React.ReactNode
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  total: number
}

export function AdminTable({
  headers,
  children,
  page,
  totalPages,
  onPageChange,
  total,
}: AdminTableProps) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {headers.map(h => (
                <th
                  key={h}
                  className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wide uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">{children}</tbody>
        </table>
      </div>
      <div className="text-muted-foreground flex items-center justify-between text-sm">
        <span>{total} total</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}>
            <ChevronLeftIcon />
          </Button>
          <span>
            Page {page} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}>
            <ChevronRightIcon />
          </Button>
        </div>
      </div>
    </div>
  )
}
