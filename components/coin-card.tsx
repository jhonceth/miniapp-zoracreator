"use client"

import type { ZoraCoin } from "@/lib/types/zora"
import { TrendingUp, TrendingDown, Copy, Heart, DollarSign, Activity, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface CoinCardProps {
  coin: ZoraCoin
  isFavorite?: boolean
  onToggleFavorite?: (coin: ZoraCoin) => void
  rank?: number
}

export function CoinCard({ coin, isFavorite = false, onToggleFavorite, rank }: CoinCardProps) {
  const [copied, setCopied] = useState(false)
  const [rotatingStatIndex, setRotatingStatIndex] = useState(0)
  const router = useRouter()

  // Rotating stats effect
  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingStatIndex((prev) => (prev + 1) % 3); // 0: Market Cap, 1: Volume 24h, 2: Holders
    }, 3000); // Cambia cada 3 segundos

    return () => clearInterval(interval);
  }, []);
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
      className="px-4 py-1 bg-card-dark border-card-dark hover:bg-card-dark/80 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer rounded-2xl shadow-lg hover:border-accent-blue/30"
      onClick={handleCardClick}
    >
      <div className="flex items-center gap-3">
        {rank && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center">
            <span className="text-sm font-bold text-accent-blue">#{rank}</span>
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
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-accent-blue/20 to-accent-blue/5 flex items-center justify-center">
              <span className="text-xl font-bold text-accent-blue">{coin.symbol.charAt(0)}</span>
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
              <Copy className={`w-4 h-4 ${copied ? "text-price-positive" : "text-secondary"}`} />
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
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-price-negative text-price-negative" : "text-secondary"}`} />
            </Button>
          </div>
        </div>

        {/* Coin Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <h3 className="font-semibold text-primary truncate">{coin.name}</h3>
              <p className="text-sm text-secondary">{coin.symbol}</p>
            </div>

            {changePercent !== null && (
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                  isPositive
                    ? "bg-price-positive/10 text-price-positive"
                    : "bg-price-negative/10 text-price-negative"
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
              <p className="text-xs text-secondary">Price</p>
              <p className="text-sm font-semibold text-primary">{formatPrice(price)}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-xs text-secondary">
                {rotatingStatIndex === 0 && (
                  <>
                    <DollarSign className="w-3 h-3" />
                    Market Cap
                  </>
                )}
                {rotatingStatIndex === 1 && (
                  <>
                    <Activity className="w-3 h-3" />
                    Volume 24h
                  </>
                )}
                {rotatingStatIndex === 2 && (
                  <>
                    <Users className="w-3 h-3" />
                    Holders
                  </>
                )}
              </div>
              <p className="text-sm font-semibold text-primary text-center">
                {rotatingStatIndex === 0 && formatCurrency(marketCap)}
                {rotatingStatIndex === 1 && formatCurrency(volume24h)}
                {rotatingStatIndex === 2 && coin.uniqueHolders.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
