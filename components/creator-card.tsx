"use client"

import type { ZoraCreator } from "@/lib/types/zora"
import { Copy, Coins, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface CreatorCardProps {
  creator: ZoraCreator
  rank: number
}

export function CreatorCard({ creator, rank }: CreatorCardProps) {
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const totalMarketCap = Number.parseFloat(creator.totalMarketCap)
  const totalVolume = Number.parseFloat(creator.totalVolume)

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
      className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-start gap-3">
        {/* Rank Badge */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-bold text-primary">#{rank}</span>
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
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Coins className="w-8 h-8 text-primary" />
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
            <Copy className={`w-4 h-4 ${copied ? "text-green-500" : ""}`} />
          </Button>
        </div>

        {/* Creator Info */}
        <div className="flex-1 min-w-0">
          <div className="mb-1">
            <h3 className="font-semibold text-foreground truncate">{creator.handle}</h3>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3">
            <div>
              <p className="text-xs text-muted-foreground">MCap</p>
              <p className="text-sm font-semibold text-foreground">{formatCurrency(totalMarketCap)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Vol 24h</p>
              <p className="text-sm font-semibold text-foreground">
                {formatCurrency(Number.parseFloat(creator.totalVolume24h))}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Vol</p>
              <p className="text-sm font-semibold text-foreground">{formatCurrency(totalVolume)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="w-3 h-3" />
                Holders
              </p>
              <p className="text-sm font-semibold text-foreground">{creator.uniqueHolders.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
