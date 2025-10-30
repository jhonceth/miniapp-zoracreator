/*
  Imagen OG dinámica para compartir Top Gainers en Farcaster Mini Apps
  - Formato 3:2 (1200x800)
  - Incluye: top 5 gainers con logo, nombre, precio, market cap, cambio 24h
  - Cache-Control recomendado para feeds
*/

import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  const width = 1200
  const height = 800

  try {
    // Obtener top 5 gainers
    console.log("🔍 Starting getTopGainers...")
    const topGainers = await getTopGainers()
    console.log("✅ getTopGainers completed, data:", JSON.stringify(topGainers, null, 2))
    
    if (!topGainers || topGainers.length === 0) {
      console.log("❌ No topGainers data, using fallback")
      return new ImageResponse(
        <div
          style={{
            width,
            height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#111827",
            color: "#F9FAFB",
            fontSize: 42,
            fontWeight: 700,
          }}
        >
          No data available
        </div>,
        { 
          width, 
          height,
          headers: {
            "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
          },
        }
      )
    }
    
    console.log("🎨 Creating ImageResponse...")
    const image = new ImageResponse(
      <div
        style={{
          width,
          height,
          display: "flex",
          flexDirection: "column",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial",
          background: "#0F172A",
          padding: "60px",
        }}
      >
        {/* Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "60px",
          }}
        >
          <h1 style={{ fontSize: "48px", fontWeight: "800", color: "#FFFFFF", margin: 0 }}>
            TOP 5 TRENDING COINS ON ZORA (24H)
          </h1>
        </div>

        {/* Column Headers */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "40px",
            marginBottom: "4px",
          }}
        >
          <div style={{ width: "60px" }}></div>
          <div style={{ width: "80px" }}></div>
          <div style={{ flex: 1 }}></div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "150px",
            }}
          >
            <span
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "#F59E0B",
              }}
            >
              24H
            </span>
          </div>
        </div>

        {/* Top 5 List - Simple Format */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            flex: 1,
          }}
        >
          {topGainers.map((coin: any, index: number) => (
            <div
              key={coin.address}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "40px",
              }}
            >
              {/* Number */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "60px",
                  height: "60px",
                  fontSize: "32px",
                  fontWeight: "800",
                  color: "#FFFFFF",
                }}
              >
                {index + 1}
              </div>
              
              {/* Logo */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "80px",
                  height: "80px",
                }}
              >
                {coin.logo ? (
                  <img
                    src={coin.logo}
                    width={80}
                    height={80}
                    style={{ borderRadius: "12px" }}
                  />
                ) : (
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "28px",
                      fontWeight: "800",
                      color: "#FFFFFF",
                      border: "2px solid rgba(255, 255, 255, 0.2)",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    {coin.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              {/* Name */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                }}
              >
                <h2 style={{ fontSize: "36px", fontWeight: "700", color: "#FFFFFF", margin: 0 }}>
                  {coin.name}
                </h2>
              </div>
              
              {/* Percentage and Volume */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "150px",
                }}
              >
                {/* Percentage */}
                <span
                  style={{
                    fontSize: "36px",
                    fontWeight: "800",
                    color: coin.change >= 0 ? "#10B981" : "#EF4444",
                    marginBottom: "8px",
                  }}
                >
                  {coin.change >= 0 ? "+" : ""}{coin.change.toFixed(1)}%
                </span>
                
                {/* Volume */}
                <span
                  style={{
                    fontSize: "24px",
                    fontWeight: "600",
                    color: "#FFFFFF",
                  }}
                >
                  {coin.volume24h || "N/A"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>,
      {
        width,
        height,
        headers: {
          "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
        },
      }
    )

    return image
  } catch (e) {
    return new ImageResponse(
      <div
        style={{
          width,
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111827",
          color: "#F9FAFB",
          fontSize: 42,
          fontWeight: 700,
        }}
      >
        ZCreate - Top Gainers
      </div>,
      { 
        width, 
        height,
        headers: {
          "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
        },
      }
    )
  }
}

async function getTopGainers() {
  try {
    // Obtener datos reales de la API de Zora
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
    console.log("🔍 Fetching from:", `${baseUrl}/api/zora/coins?type=TOP_GAINERS&count=5`)
    
    const response = await fetch(`${baseUrl}/api/zora/coins?type=TOP_GAINERS&count=5`)
    console.log("📡 Response status:", response.status, response.ok)
    
    if (!response.ok) {
      console.warn('❌ Failed to fetch top gainers from API, using fallback')
      return getFallbackGainers()
    }
    
    const data = await response.json()
    console.log("📊 Raw API data:", JSON.stringify(data, null, 2))
    
    if (data.coins && data.coins.length > 0) {
      const mappedCoins = data.coins.slice(0, 5).map((coin: any) => ({
        address: coin.address,
        name: coin.name,
        symbol: coin.symbol,
        price: `$${parseFloat(coin.priceUsd || "0").toFixed(4)}`,
        marketCap: formatMarketCap(coin.marketCap),
        change: coin.changePercent24h || 0,
        volume24h: formatVolume(coin.volume24h),
        logo: coin.imageUrl
      }))
      console.log("✅ Mapped coins:", JSON.stringify(mappedCoins, null, 2))
      return mappedCoins
    }
    
    console.log("⚠️ No coins in data, using fallback")
    return getFallbackGainers()
  } catch (error) {
    console.error('❌ Error fetching top gainers:', error)
    return getFallbackGainers()
  }
}


function formatMarketCap(marketCap: string): string {
  const value = parseFloat(marketCap || "0")
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(1)}B`
  } else if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(1)}M`
  } else if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(1)}K`
  }
  return `$${value.toFixed(2)}`
}

function formatVolume(volume: string): string {
  const value = parseFloat(volume || "0")
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(1)}B`
  } else if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(1)}M`
  } else if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(1)}K`
  }
  return `$${value.toFixed(2)}`
}

function getFallbackGainers() {
  return [
    {
      address: "0x123...",
      name: "Bitcoin",
      symbol: "BTC",
      price: "$45,234.56",
      marketCap: "$856.2B",
      change: 12.34,
      volume24h: "$2.4B",
      logo: null
    },
    {
      address: "0x456...",
      name: "Ethereum",
      symbol: "ETH",
      price: "$2,456.78",
      marketCap: "$295.4B",
      change: 8.76,
      volume24h: "$1.8B",
      logo: null
    },
    {
      address: "0x789...",
      name: "Solana",
      symbol: "SOL",
      price: "$98.45",
      marketCap: "$42.1B",
      change: 15.23,
      volume24h: "$856M",
      logo: null
    },
    {
      address: "0xabc...",
      name: "Cardano",
      symbol: "ADA",
      price: "$0.45",
      marketCap: "$15.8B",
      change: 6.78,
      volume24h: "$234M",
      logo: null
    },
    {
      address: "0xdef...",
      name: "Polygon",
      symbol: "MATIC",
      price: "$0.89",
      marketCap: "$8.2B",
      change: 4.56,
      volume24h: "$189M",
      logo: null
    }
  ]
}
