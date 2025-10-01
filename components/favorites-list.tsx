"use client"

import { CoinCard } from "./coin-card"
import { useFavorites } from "@/hooks/use-favorites"
import { Heart } from "lucide-react"

export function FavoritesList() {
  const { favorites, isFavorite, toggleFavorite, isLoaded } = useFavorites()

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Heart className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No favorites yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Add coins to your favorites by tapping the heart icon on any coin
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 px-4 pb-4">
      {favorites.map((coin) => (
        <CoinCard
          key={coin.address}
          coin={coin}
          isFavorite={isFavorite(coin.address)}
          onToggleFavorite={toggleFavorite}
        />
      ))}
    </div>
  )
}
