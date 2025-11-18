import { Suspense } from 'react'
import SearchPageClient from './SearchPageClient'

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <p className="text-gray-600">Loading search results...</p>
        </div>
      }
    >
      <SearchPageClient />
    </Suspense>
  )
}