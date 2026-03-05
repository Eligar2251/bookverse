import { Skeleton } from '@/components/ui/skeleton'
export default function Loading() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <Skeleton className="h-8 w-48 mb-6" />
      <Skeleton className="h-10 w-full mb-4" />
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
    </div>
  )
}