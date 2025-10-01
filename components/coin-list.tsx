"use client"

import type { ZoraCoin, ExploreType } from "@/lib/types/zora"
import { CoinCard } from "./coin-card"
import { useFavorites } from "@/hooks/use-favorites"
import { usePagination } from "@/hooks/use-pagination"
import { PaginationControls } from "./pagination-controls"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CoinListProps {
  type: ExploreType
}

interface ApiResponse {
  coins: ZoraCoin[]
  pageInfo?: {
    hasNextPage: boolean
    endCursor: string | null
  }
}

export function CoinList({ type }: CoinListProps) {
  const { isFavorite, toggleFavorite } = useFavorites()

  const {
    items: coins,
    isLoading,
    error,
    hasMore,
    currentPage,
    totalPages,
    goToPage,
    isInfiniteScrollMode,
    observerRef,
  } = usePagination<ZoraCoin>({
    fetchFn: async (cursor, count) => {
      const url = new URL("/api/zora/coins", window.location.origin)
      url.searchParams.set("type", type)
      url.searchParams.set("count", String(count || 5))
      if (cursor) url.searchParams.set("after", cursor)

      const res = await fetch(url.toString())
      if (!res.ok) throw new Error("Failed to load coins")

      const data: ApiResponse = await res.json()
      return {
        items: data.coins,
        pageInfo: data.pageInfo,
      }
    },
    initialPageSize: 5,
    incrementSize: 5,
    maxInfiniteScroll: 20,
    fullPageSize: 20,
    cacheKey: `coins-${type}`,
  })

  if (isLoading && coins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading coins...</p>
      </div>
    )
  }

  // Error state
  if (error && coins.length === 0) {
    return (
      <Alert variant="destructive" className="mx-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load data. Please try again later.</AlertDescription>
      </Alert>
    )
  }

  // Empty state
  if (!isLoading && coins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No data available</h3>
        <p className="text-sm text-muted-foreground text-center">No coins found in this category at the moment.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3 px-4">
        {coins.map((coin, index) => {
          const isLastItem = index === coins.length - 1
          const rank = isInfiniteScrollMode ? index + 1 : (currentPage - 1) * 20 + index + 1
          return (
            <div key={coin.address} ref={isLastItem && isInfiniteScrollMode ? observerRef : null}>
              <CoinCard
                coin={coin}
                isFavorite={isFavorite(coin.address)}
                onToggleFavorite={toggleFavorite}
                rank={rank}
              />
            </div>
          )
        })}
      </div>

      {isLoading && isInfiniteScrollMode && coins.length > 0 && (
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
