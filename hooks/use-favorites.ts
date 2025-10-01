"use client"

import { useState, useEffect } from "react"
import type { ZoraCoin } from "@/lib/types/zora"

const FAVORITES_KEY = "zora-coins-favorites"

export function useFavorites() {
  const [favorites, setFavorites] = useState<ZoraCoin[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY)
      if (stored) {
        setFavorites(JSON.parse(stored))
      }
    } catch (error) {
      console.error("Error loading favorites:", error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
      } catch (error) {
        console.error("Error saving favorites:", error)
      }
    }
  }, [favorites, isLoaded])

  const isFavorite = (address: string) => {
    return favorites.some((coin) => coin.address === address)
  }

  const toggleFavorite = (coin: ZoraCoin) => {
    setFavorites((prev) => {
      const exists = prev.some((c) => c.address === coin.address)
      if (exists) {
        return prev.filter((c) => c.address !== coin.address)
      } else {
        return [...prev, coin]
      }
    })
  }

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    isLoaded,
  }
}
