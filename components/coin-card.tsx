"use client"

import type { ZoraCoin } from "@/lib/types/zora"
import { TrendingUp, TrendingDown, Copy, Heart } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface CoinCardProps {
  coin: ZoraCoin
  isFavorite?: boolean
  onToggleFavorite?: (coin: ZoraCoin) => void
  rank?: number
}

export function CoinCard({ coin, isFavorite = false, onToggleFavorite, rank }: CoinCardProps) {
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const marketCap = Number.parseFloat(coin.marketCap)
  const volume24h = Number.parseFloat(coin.volume24h)
  const price = Number.parseFloat(coin.priceUsd)
  const changePercent = coin.changePercent24h

  const isPositive = changePercent !== null && changePercent > 0

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`
    } else if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(2)}K`
    }
    return `$${value.toFixed(2)}`
  }

  const formatPrice = (value: number) => {
    if (value === 0) return "$0.00"
    if (value < 0.01) {
      return `$${value.toFixed(6)}`
    } else if (value < 1) {
      return `$${value.toFixed(4)}`
    }
    return formatCurrency(value)
  }

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(coin.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Error copying address:", error)
    }
  }

  const handleToggleFavorite = () => {
    if (onToggleFavorite) {
      onToggleFavorite(coin)
    }
  }

  const handleCardClick = () => {
    router.push(`/token/${coin.address}`)
  }

  return (
    <Card 
      className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-start gap-3">
        {rank && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">#{rank}</span>
          </div>
        )}

        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          {coin.imageUrl ? (
            <img
              src={coin.imageUrl || "/placeholder.svg"}
              alt={coin.name}
              className="w-16 h-16 rounded-lg object-cover bg-muted"
              onError={(e) => {
                e.currentTarget.src = "/single-gold-coin.png"
              }}
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <span className="text-xl font-bold text-primary">{coin.symbol.charAt(0)}</span>
            </div>
          )}

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 touch-manipulation active:scale-95 transition-transform"
              onClick={(e) => {
                e.stopPropagation()
                handleCopyAddress()
              }}
              title="Copy contract"
            >
              <Copy className={`w-4 h-4 ${copied ? "text-green-500" : ""}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 touch-manipulation active:scale-95 transition-transform"
              onClick={(e) => {
                e.stopPropagation()
                handleToggleFavorite()
              }}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Coin Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">{coin.name}</h3>
              <p className="text-sm text-muted-foreground">{coin.symbol}</p>
            </div>

            {changePercent !== null && (
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                  isPositive
                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                }`}
              >
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>
                  {isPositive ? "+" : ""}
                  {changePercent.toFixed(2)}%
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3">
            <div>
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="text-sm font-semibold text-foreground">{formatPrice(price)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Market Cap</p>
              <p className="text-sm font-semibold text-foreground">{formatCurrency(marketCap)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Volume 24h</p>
              <p className="text-sm font-semibold text-foreground">{formatCurrency(volume24h)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Holders</p>
              <p className="text-sm font-semibold text-foreground">{coin.uniqueHolders.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
