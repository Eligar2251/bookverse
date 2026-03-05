import { Skeleton } from '@/components/ui/skeleton'
export default function Loading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Skeleton className="h-8 w-40 mb-6" />
      <Skeleton className="h-10 w-72 mb-4" />
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
      </div>
    </div>
  )
}