import { Skeleton } from '@/components/ui/skeleton'

export default function BookLoading() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <Skeleton className="w-48 md:w-56 aspect-[2/3] rounded-xl mx-auto md:mx-0" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-40" />
          <div className="flex gap-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-10 w-48" />
        </div>
      </div>
    </div>
  )
}