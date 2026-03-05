import { Skeleton } from '@/components/ui/skeleton'

export default function BooksLoading() {
  return (
    <div className="p-6 max-w-5xl space-y-6">
      <div className="flex justify-between"><Skeleton className="h-8 w-40" /><Skeleton className="h-9 w-36" /></div>
      {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
    </div>
  )
}