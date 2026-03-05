import { Skeleton } from '@/components/ui/skeleton'
export default function Loading() {
  return (
    <div className="p-6 max-w-5xl space-y-6">
      <div className="flex justify-between"><Skeleton className="h-8 w-48" /><Skeleton className="h-9 w-40" /></div>
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-36 rounded-xl" />)}
      </div>
    </div>
  )
}