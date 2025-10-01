"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { dataCache } from "@/lib/cache"

interface UsePaginationProps<T> {
  fetchFn: (
    cursor?: string,
    count?: number,
  ) => Promise<{
    items: T[]
    pageInfo?: {
      hasNextPage: boolean
      endCursor: string | null
    }
  }>
  initialPageSize?: number
  incrementSize?: number
  maxInfiniteScroll?: number
  fullPageSize?: number
  cacheKey?: string
}

interface UsePaginationReturn<T> {
  items: T[]
  isLoading: boolean
  error: Error | null
  hasMore: boolean
  loadMore: () => void
  currentPage: number
  totalPages: number
  goToPage: (page: number) => void
  isInfiniteScrollMode: boolean
  observerRef: (node: HTMLDivElement | null) => void
}

export function usePagination<T>({
  fetchFn,
  initialPageSize = 5,
  incrementSize = 5,
  maxInfiniteScroll = 20,
  fullPageSize = 20,
  cacheKey,
}: UsePaginationProps<T>): UsePaginationReturn<T> {
  const [items, setItems] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isInfiniteScrollMode, setIsInfiniteScrollMode] = useState(true)
  const [allFetchedItems, setAllFetchedItems] = useState<T[]>([])

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadingRef = useRef(false)

  useEffect(() => {
    if (cacheKey) {
      const cachedData = dataCache.get<{
        items: T[]
        allFetchedItems: T[]
        cursor?: string
        hasMore: boolean
        isInfiniteScrollMode: boolean
        currentPage: number
        totalPages: number
      }>(cacheKey)

      if (cachedData) {
        console.log("[v0] Loading from cache:", cacheKey)
        setItems(cachedData.items)
        setAllFetchedItems(cachedData.allFetchedItems)
        setCursor(cachedData.cursor)
        setHasMore(cachedData.hasMore)
        setIsInfiniteScrollMode(cachedData.isInfiniteScrollMode)
        setCurrentPage(cachedData.currentPage)
        setTotalPages(cachedData.totalPages)
        setIsLoading(false)
        return
      }
    }

    loadInitial()
  }, [cacheKey])

  const loadInitial = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await fetchFn(undefined, initialPageSize)
      setItems(result.items)
      setAllFetchedItems(result.items)
      setCursor(result.pageInfo?.endCursor || undefined)
      setHasMore(result.pageInfo?.hasNextPage || false)

      if (cacheKey) {
        dataCache.set(cacheKey, {
          items: result.items,
          allFetchedItems: result.items,
          cursor: result.pageInfo?.endCursor,
          hasMore: result.pageInfo?.hasNextPage || false,
          isInfiniteScrollMode: true,
          currentPage: 1,
          totalPages: 1,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load data"))
    } finally {
      setIsLoading(false)
    }
  }

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return

    loadingRef.current = true
    setIsLoading(true)

    try {
      const currentCount = allFetchedItems.length
      const nextCount = Math.min(currentCount + incrementSize, maxInfiniteScroll)
      const itemsToFetch = nextCount - currentCount

      const result = await fetchFn(cursor, itemsToFetch)
      const newItems = [...allFetchedItems, ...result.items]

      setAllFetchedItems(newItems)
      setItems(newItems)
      setCursor(result.pageInfo?.endCursor || undefined)
      setHasMore(result.pageInfo?.hasNextPage || false)

      const shouldSwitchToPagination = newItems.length >= maxInfiniteScroll
      if (shouldSwitchToPagination) {
        setIsInfiniteScrollMode(false)
        const estimatedTotal = result.pageInfo?.hasNextPage ? 100 : newItems.length
        const pages = Math.ceil(estimatedTotal / fullPageSize)
        setTotalPages(pages)

        if (cacheKey) {
          dataCache.set(cacheKey, {
            items: newItems,
            allFetchedItems: newItems,
            cursor: result.pageInfo?.endCursor,
            hasMore: result.pageInfo?.hasNextPage || false,
            isInfiniteScrollMode: false,
            currentPage: 1,
            totalPages: pages,
          })
        }
      } else {
        if (cacheKey) {
          dataCache.set(cacheKey, {
            items: newItems,
            allFetchedItems: newItems,
            cursor: result.pageInfo?.endCursor,
            hasMore: result.pageInfo?.hasNextPage || false,
            isInfiniteScrollMode: true,
            currentPage: 1,
            totalPages: 1,
          })
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load more data"))
    } finally {
      setIsLoading(false)
      loadingRef.current = false
    }
  }, [cursor, hasMore, allFetchedItems, fetchFn, incrementSize, maxInfiniteScroll, fullPageSize, cacheKey])

  const goToPage = useCallback(
    async (page: number) => {
      if (page < 1 || page > totalPages || page === currentPage) return

      setIsLoading(true)
      setCurrentPage(page)

      try {
        // Calculate how many items we need for this page
        const startIndex = (page - 1) * fullPageSize
        const endIndex = startIndex + fullPageSize
        const itemsNeeded = endIndex

        // If we don't have enough items, fetch more
        let updatedItems = allFetchedItems
        let updatedCursor = cursor
        let updatedHasMore = hasMore

        while (updatedItems.length < itemsNeeded && updatedHasMore) {
          const itemsToFetch = Math.min(fullPageSize, itemsNeeded - updatedItems.length)
          const result = await fetchFn(updatedCursor, itemsToFetch)

          updatedItems = [...updatedItems, ...result.items]
          updatedCursor = result.pageInfo?.endCursor || undefined
          updatedHasMore = result.pageInfo?.hasNextPage || false

          // Update state with new fetched items
          setAllFetchedItems(updatedItems)
          setCursor(updatedCursor)
          setHasMore(updatedHasMore)

          // If we got no new items, break to avoid infinite loop
          if (result.items.length === 0) break
        }

        // Now slice the page from the updated items
        const pageItems = updatedItems.slice(startIndex, endIndex)
        setItems(pageItems)

        // Update cache with new data
        if (cacheKey) {
          dataCache.set(cacheKey, {
            items: pageItems,
            allFetchedItems: updatedItems,
            cursor: updatedCursor,
            hasMore: updatedHasMore,
            isInfiniteScrollMode,
            currentPage: page,
            totalPages,
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load page"))
      } finally {
        setIsLoading(false)
      }
    },
    [currentPage, totalPages, allFetchedItems, fullPageSize, cacheKey, cursor, hasMore, isInfiniteScrollMode, fetchFn],
  )

  const lastItemRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || !isInfiniteScrollMode) return
      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore()
        }
      })

      if (node) observerRef.current.observe(node)
    },
    [isLoading, hasMore, loadMore, isInfiniteScrollMode],
  )

  return {
    items,
    isLoading,
    error,
    hasMore,
    loadMore,
    currentPage,
    totalPages,
    goToPage,
    isInfiniteScrollMode,
    observerRef: lastItemRef,
  }
}
