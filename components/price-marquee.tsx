"use client"

import { useEffect, useState } from "react"

interface PriceData {
  eth: number
  zora: number
}

export function PriceMarquee() {
  const [prices, setPrices] = useState<PriceData>({ eth: 0, zora: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch("/api/prices")
        if (response.ok) {
          const data = await response.json()
          setPrices(data)
        }
      } catch (error) {
        console.error("Error fetching prices:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrices()
    // Refresh prices every 30 seconds
    const interval = setInterval(fetchPrices, 30000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="w-full overflow-hidden bg-primary/5 border-b border-border">
        <div className="py-2 px-4">
          <div className="h-5 bg-muted animate-pulse rounded" />
        </div>
      </div>
    )
  }

  const priceText = `ETH: $${prices.eth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} • ZORA: $${prices.zora.toFixed(4)}`

  return (
    <div className="w-full overflow-hidden bg-primary/5 border-b border-border">
      <div className="animate-marquee whitespace-nowrap py-2 px-4">
        <span className="text-sm font-medium text-foreground inline-block mx-8">{priceText}</span>
        <span className="text-sm font-medium text-foreground inline-block mx-8">{priceText}</span>
        <span className="text-sm font-medium text-foreground inline-block mx-8">{priceText}</span>
        <span className="text-sm font-medium text-foreground inline-block mx-8">{priceText}</span>
      </div>
    </div>
  )
}
