import { Skeleton } from '@/components/ui/skeleton'

export default function CatalogLoading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-56 shrink-0 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[2/3] rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}