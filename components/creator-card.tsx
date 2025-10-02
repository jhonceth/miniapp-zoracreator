"use client"

import type { ZoraCreator } from "@/lib/types/zora"
import { Copy, Coins, Users, DollarSign, Activity } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface CreatorCardProps {
  creator: ZoraCreator
  rank: number
}

export function CreatorCard({ creator, rank }: CreatorCardProps) {
  const [copied, setCopied] = useState(false)
  const [rotatingStatIndex, setRotatingStatIndex] = useState(0)
  const router = useRouter()
  const totalMarketCap = Number.parseFloat(creator.totalMarketCap)
  const totalVolume = Number.parseFloat(creator.totalVolume)

  // Rotating stats effect
  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingStatIndex((prev) => (prev + 1) % 3); // 0: Market Cap, 1: Volume 24h, 2: Holders
    }, 3000); // Cambia cada 3 segundos

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`
    } else if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(2)}K`
    }
    return `$${value.toFixed(2)}`
  }

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(creator.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Error copying address:", error)
    }
  }

  const handleCardClick = () => {
    // Navegar al perfil del token del creador (usar la dirección del primer token)
    const tokenAddress = creator.topCoins[0]?.address
    if (tokenAddress) {
      router.push(`/token/${tokenAddress}`)
    }
  }

  return (
    <Card 
      className="px-4 py-1 bg-card-dark border-card-dark hover:bg-card-dark/80 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer rounded-2xl shadow-lg hover:border-accent-blue/30"
      onClick={handleCardClick}
    >
      <div className="flex items-center gap-3">
        {/* Rank Badge */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center">
          <span className="text-sm font-bold text-accent-blue">#{rank}</span>
        </div>

        {/* Avatar and Copy Button */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          {creator.avatarUrl ? (
            <img
              src={creator.avatarUrl || "/placeholder.svg"}
              alt={creator.handle}
              className="w-16 h-16 rounded-lg object-cover bg-muted"
              onError={(e) => {
                e.currentTarget.src = "/single-gold-coin.png"
              }}
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-accent-blue/20 to-accent-blue/5 flex items-center justify-center">
              <Coins className="w-8 h-8 text-accent-blue" />
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 touch-manipulation active:scale-95 transition-transform"
            onClick={(e) => {
              e.stopPropagation()
              handleCopyAddress()
            }}
            title="Copy address"
          >
            <Copy className={`w-4 h-4 ${copied ? "text-price-positive" : "text-secondary"}`} />
          </Button>
        </div>

        {/* Creator Info */}
        <div className="flex-1 min-w-0">
          <div className="mb-1">
            <h3 className="font-semibold text-primary truncate">{creator.handle}</h3>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3">
            <div>
              <p className="text-xs text-secondary">Total Vol</p>
              <p className="text-sm font-semibold text-primary">{formatCurrency(totalVolume)}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-xs text-secondary">
                {rotatingStatIndex === 0 && (
                  <>
                    <DollarSign className="w-3 h-3" />
                    MCap
                  </>
                )}
                {rotatingStatIndex === 1 && (
                  <>
                    <Activity className="w-3 h-3" />
                    Vol 24h
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
                {rotatingStatIndex === 0 && formatCurrency(totalMarketCap)}
                {rotatingStatIndex === 1 && formatCurrency(Number.parseFloat(creator.totalVolume24h))}
                {rotatingStatIndex === 2 && creator.uniqueHolders.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
