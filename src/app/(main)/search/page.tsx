import { Suspense } from 'react'
import { SearchContent } from './search-content'

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container mx-auto max-w-4xl px-4 py-8"><div className="h-10 bg-muted rounded animate-pulse" /></div>}>
      <SearchContent />
    </Suspense>
  )
}