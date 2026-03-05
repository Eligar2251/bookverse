import { Suspense } from 'react'
import { CatalogContent } from './catalog-content'

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-[2/3] bg-muted rounded-lg animate-pulse" />
              <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  )
}