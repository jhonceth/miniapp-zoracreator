/*
  Imagen OG dinámica para compartir tokens en Farcaster Mini Apps
  - Formato 3:2 (1200x800)
  - Incluye: logo, nombre, precio, cambio 24h, holders
  - Cache-Control recomendado para feeds
*/

import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"
import { getCoin } from "@zoralabs/coins-sdk"

export const runtime = "edge"

export async function GET(req: NextRequest, { params }: { params: Promise<{ address: string }> }) {
  const { address } = await params

  // Dimensiones 3:2
  const width = 1200
  const height = 800

  try {
    let coinName = "Token"
    let coinSymbol = ""
    let priceUsdText = "N/A"
    let holdersText = "N/A"
    let changePctText = "0.00%"
    let changeColor = "#9CA3AF" // gray-400
    let logoSrc: string | undefined
    let createdAgoText = "N/A"
    let marketCapText = "N/A"
    let volumeText = "N/A"
    let liquidityText = "N/A"

    try {
      const response = await getCoin({ address, chain: 8453 })
      const token = response.data?.zora20Token
      if (token) {
        coinName = token.name || coinName
        coinSymbol = token.symbol ? ` (${token.symbol})` : ""
        if (token.tokenPrice?.priceInUsdc) {
          const price = Number.parseFloat(token.tokenPrice.priceInUsdc)
          priceUsdText = isFinite(price)
            ? new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 2,
                maximumFractionDigits: 8,
              }).format(price)
            : "N/A"
        }
        if (typeof token.uniqueHolders === "number") {
          holdersText = token.uniqueHolders.toLocaleString()
        }
        if (token.marketCapDelta24h && token.marketCap) {
          const currentMarketCap = Number.parseFloat(token.marketCap) || 0
          const change24h = Number.parseFloat(token.marketCapDelta24h) || 0
          const marketCap24hAgo = currentMarketCap - change24h
          let pct = 0
          if (marketCap24hAgo > 0) pct = (change24h / marketCap24hAgo) * 100
          changePctText = `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`
          changeColor = pct >= 0 ? "#10B981" : "#EF4444" // green/red

          // Format market cap
          if (currentMarketCap >= 1000000) {
            marketCapText = `$${(currentMarketCap / 1000000).toFixed(0)}M`
          } else if (currentMarketCap >= 1000) {
            marketCapText = `$${(currentMarketCap / 1000).toFixed(0)}K`
          } else {
            marketCapText = `$${currentMarketCap.toFixed(0)}`
          }
        }

        // Usar datos reales de volume24h
        if (token.volume24h) {
          const volume = Number.parseFloat(token.volume24h) || 0
          if (volume >= 1000000) {
            volumeText = `$${(volume / 1000000).toFixed(1)}M`
          } else if (volume >= 1000) {
            volumeText = `$${(volume / 1000).toFixed(0)}K`
          } else {
            volumeText = `$${volume.toFixed(0)}`
          }
        } else {
          volumeText = "N/A"
        }

        // Calcular liquidity basado en market cap y otros factores
        // Por ahora usamos market cap como proxy de liquidity
        if (token.marketCap) {
          const marketCap = Number.parseFloat(token.marketCap) || 0
          // Liquidity típicamente es una fracción del market cap
          const liquidity = marketCap * 0.1 // Estimación: 10% del market cap
          if (liquidity >= 1000000) {
            liquidityText = `$${(liquidity / 1000000).toFixed(1)}M`
          } else if (liquidity >= 1000) {
            liquidityText = `$${(liquidity / 1000).toFixed(0)}K`
          } else {
            liquidityText = `$${liquidity.toFixed(0)}`
          }
        } else {
          liquidityText = "N/A"
        }

        logoSrc = token.mediaContent?.previewImage?.medium || token.mediaContent?.previewImage?.small
        if (token.createdAt) {
          const created = new Date(token.createdAt)
          const now = new Date()
          const diffMs = Math.max(0, now.getTime() - created.getTime())
          const minutes = Math.floor(diffMs / 60000)
          const hours = Math.floor(minutes / 60)
          const days = Math.floor(hours / 24)
          const months = Math.floor(days / 30)
          const years = Math.floor(days / 365)
          if (years >= 1) createdAgoText = `${years}y ago`
          else if (months >= 1) createdAgoText = `${months}mo ago`
          else if (days >= 1) createdAgoText = `${days}d ago`
          else if (hours >= 1) createdAgoText = `${hours}h ago`
          else createdAgoText = `${Math.max(1, minutes)}m ago`
        }
      }
    } catch {}

    // Preparar imagen del logo si existe
    let logoElement: any = null
    if (logoSrc) {
      logoElement = (
        <img
          src={logoSrc || "/placeholder.svg"}
          width={80}
          height={80}
          style={{
            objectFit: "cover",
            borderRadius: "50%",
          }}
        />
      )
    }

    const image = new ImageResponse(
      <div
        style={{
          width,
          height,
          display: "flex",
          flexDirection: "column",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial",
          position: "relative",
          background: logoSrc ? `url(${logoSrc})` : "#E5E7EB",
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Top Left Icon */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: "20px",
            left: "20px",
            zIndex: 10,
          }}
        >
          <img
            src={`${req.nextUrl.origin}/icon.png`}
            width={80}
            height={80}
            style={{
              borderRadius: "8px",
            }}
          />
        </div>

        {/* Top Center - Statistics Title */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            fontSize: "40px",
            fontWeight: "800",
            color: "#FFFFFF",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
          }}
        >
          STATISTICS
        </div>

        {/* Top Section - Price and Holders */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-end",
            padding: "40px 60px",
            color: "#1F2937",
            height: "50%",
            gap: "20px",
            position: "relative",
            width: "100%",
            zIndex: 2,
          }}
        >
          {/* Overlay negro para mejorar legibilidad del texto */}
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.3)",
              zIndex: 1,
            }}
          />
          
          {/* Contenido con z-index para estar sobre el overlay */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "20px",
              zIndex: 2,
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: "60px",
                fontWeight: "800",
                color: "#FFFFFF",
                alignItems: "center",
              }}
            >
              <span style={{ marginRight: "12px" }}>🚀</span>{priceUsdText}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "44px",
                fontWeight: "600",
                color: "#FFFFFF",
                alignItems: "center",
              }}
            >
              <span style={{ color: "#3B82F6", marginRight: "8px" }}>👥</span> {holdersText}
            </div>
          </div>
        </div>

        {/* Bottom Section - Statistics Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "40px 60px",
            background: "rgba(0, 0, 0, 0.8)",
            color: "#F9FAFB",
            height: "50%",
            gap: "40px",
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 3,
          }}
        >
          {/* Logo and Name Container */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              minWidth: "200px",
              flexShrink: 0,
            }}
          >
            {/* Nombre del token arriba del logo */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: "36px",
                fontWeight: "700",
                color: "#F9FAFB",
                lineHeight: "1.2",
                textAlign: "center",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                width: "100%",
                maxWidth: "400px",
              }}
            >
              {coinName.toUpperCase()}
            </div>

            {/* Logo */}
            <div
              style={{
                display: "flex",
                width: "180px",
                height: "180px",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              {logoSrc ? (
                <img
                  src={logoSrc}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    fontSize: "48px",
                    fontWeight: "800",
                    color: "#FFFFFF",
                  }}
                >
                  {(coinName || "T").slice(0, 1)}
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div
            style={{
              display: "flex",
              flex: 1,
              justifyContent: "space-around",
              alignItems: "center",
            }}
          >
            {/* MCAP Column */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: "32px",
                  fontWeight: "600",
                  color: "#9CA3AF",
                }}
              >
                MCAP <span style={{ color: changeColor, marginLeft: "8px" }}>{changePctText}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: "52px",
                  fontWeight: "800",
                  color: "#F9FAFB",
                }}
              >
                {marketCapText}
              </div>
            </div>

            {/* 24H VOL Column */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: "32px",
                  fontWeight: "600",
                  color: "#9CA3AF",
                }}
              >
                24H VOL
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: "52px",
                  fontWeight: "800",
                  color: "#F9FAFB",
                }}
              >
                {volumeText}
              </div>
            </div>

            {/* LIQUIDITY Column */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: "32px",
                  fontWeight: "600",
                  color: "#9CA3AF",
                }}
              >
                LIQUIDITY
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: "52px",
                  fontWeight: "800",
                  color: "#F9FAFB",
                }}
              >
                {liquidityText}
              </div>
            </div>
          </div>
        </div>
      </div>,
      {
        width,
        height,
        headers: {
          "Cache-Control": "public, immutable, no-transform, max-age=300",
        },
      },
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
        ZBase Analytics
      </div>,
      { width, height },
    )
  }
}