"use client"

import type { ZoraCreator } from "@/lib/types/zora"
import { CreatorCard } from "./creator-card"
import { usePagination } from "@/hooks/use-pagination"
import { PaginationControls } from "./pagination-controls"
import { Loader2, AlertCircle } from "lucide-react"

interface ApiResponse {
  creators: ZoraCreator[]
  pageInfo?: {
    hasNextPage: boolean
    endCursor: string | null
  }
}

export function CreatorsList() {
  const {
    items: creators,
    isLoading,
    error,
    currentPage,
    totalPages,
    goToPage,
    isInfiniteScrollMode,
    observerRef,
  } = usePagination<ZoraCreator>({
    fetchFn: async (cursor, count) => {
      const url = new URL("/api/zora/creators", window.location.origin)
      url.searchParams.set("count", String(count || 5))
      if (cursor) url.searchParams.set("after", cursor)

      const res = await fetch(url.toString())
      if (!res.ok) throw new Error("Failed to load creators")

      const data: ApiResponse = await res.json()
      return {
        items: data.creators,
        pageInfo: data.pageInfo,
      }
    },
    initialPageSize: 5,
    incrementSize: 5,
    maxInfiniteScroll: 20,
    fullPageSize: 20,
    cacheKey: "creators",
  })

  if (isLoading && creators.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading creators...</p>
      </div>
    )
  }

  // Error state
  if (error && creators.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center px-4">
        <AlertCircle className="w-12 h-12 text-destructive mb-3" />
        <p className="text-muted-foreground mb-2">Failed to load creators</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    )
  }

  // Empty state
  if (!isLoading && creators.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center px-4">
        <p className="text-muted-foreground">No creators found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3 px-4">
        {creators.map((creator, index) => {
          const isLastItem = index === creators.length - 1
          const rank = isInfiniteScrollMode ? index + 1 : (currentPage - 1) * 20 + index + 1

          return (
            <div key={creator.address} ref={isLastItem && isInfiniteScrollMode ? observerRef : null}>
              <CreatorCard creator={creator} rank={rank} />
            </div>
          )
        })}
      </div>

      {isLoading && isInfiniteScrollMode && creators.length > 0 && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {!isInfiniteScrollMode && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}
