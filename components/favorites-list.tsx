"use client"

import { CoinCard } from "./coin-card"
import { useFavorites } from "@/hooks/use-favorites"
import { Star } from "lucide-react"

export function FavoritesList() {
  const { favorites, isFavorite, toggleFavorite, isLoaded } = useFavorites()

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-accent-blue/20 border-t-accent-blue rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-price-positive/30 rounded-full animate-spin animate-reverse"></div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-accent-blue rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-accent-blue rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-accent-blue rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
        <p className="text-sm text-secondary mt-3 animate-pulse-glow">Loading favorites...</p>
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Star className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No favorites yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Add coins to your favorites by tapping the star icon on any coin
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2 px-4 pb-4">
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
