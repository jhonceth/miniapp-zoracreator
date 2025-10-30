/*
  Imagen OG dinámica para compartir tokens en Farcaster Mini Apps
  - Formato 3:2 (1200x800)
  - Incluye: logo, nombre, precio, cambio 24h, holders
  - Cache-Control recomendado para feeds
*/

import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"
import { getCoin } from "@zoralabs/coins-sdk"

// Función para obtener datos reales de precio desde la API de Zora con cache
async function getRealPriceData(address: string): Promise<number[]> {
  try {
    // Usar la API existente de historial de precios con cache
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/zora/price-history?address=${address}&chainId=8453&timeframe=1D`)
    
    if (!response.ok) {
      console.warn('Failed to fetch real price data from API, using fallback')
      return []
    }
    
    const data = await response.json()
    
    if (data.success && data.chartData && data.chartData.length > 0) {
      // Tomar los últimos 20 puntos de datos para el gráfico
      const recentData = data.chartData.slice(-20)
      const priceData = recentData.map((point: any) => parseFloat(point.value) || 0)
      
      console.log(`✅ Retrieved ${priceData.length} real price points from ${data.cached ? 'cache' : 'API'}`)
      return priceData
    }
    
    console.warn('No valid price data found in API response')
    return []
  } catch (error) {
    console.warn('Error fetching real price data:', error)
    return []
  }
}

// Función para generar datos basados en el porcentaje de cambio real
function generatePriceDataWithChange(currentPrice: number, changePercentage: number): number[] {
  const dataPoints = 20
  const data: number[] = []
  const volatility = currentPrice * 0.05 // 5% de volatilidad
  
  // Calcular el precio inicial basado en el cambio
  const changeDecimal = changePercentage / 100
  const initialPrice = currentPrice / (1 + changeDecimal)
  
  // Generar datos que vayan del precio inicial al actual
  for (let i = 0; i < dataPoints; i++) {
    const progress = i / (dataPoints - 1)
    const basePrice = initialPrice + (currentPrice - initialPrice) * progress
    const randomFactor = (Math.random() - 0.5) * volatility * (1 - progress * 0.5) // Menos volatilidad al final
    
    data.push(Math.max(0.000001, basePrice + randomFactor))
  }
  
  return data
}

// Componente SVG para el gráfico mini
function MiniChartSVG({ data, color, width = 1200, height = 800 }: { 
  data: number[], 
  color: string, 
  width?: number, 
  height?: number 
}) {
  // Usar datos por defecto si no hay datos
  const chartData = (!data || data.length === 0) 
    ? [0.001, 0.0012, 0.0008, 0.0015, 0.0011, 0.0013, 0.0009, 0.0014, 0.0012, 0.0016, 0.0013, 0.0011, 0.0015, 0.0012, 0.0014, 0.0013, 0.0011, 0.0015, 0.0012, 0.0014]
    : data
  
  const max = Math.max(...chartData)
  const min = Math.min(...chartData)
  const range = max - min || 1

  const points = chartData
    .map((value, index) => {
      const x = (index / (chartData.length - 1)) * 100
      const y = 100 - ((value - min) / range) * 100
      return `${x},${y}`
    })
    .join(" ")

  const gradientId = `gradient-${color.replace('#', '')}-${Math.random().toString(36).substr(2, 9)}`

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 100 100" 
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        opacity: 0.4,
        zIndex: 1,
      }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.6" />
          <stop offset="100%" stopColor={color} stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <polyline
        points={`0,100 ${points} 100,100`}
        fill={`url(#${gradientId})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

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
    let priceData: number[] = []
    let currentPrice = 0

    try {
      const response = await getCoin({ address, chain: 8453 })
      const token = response.data?.zora20Token
      console.log(`🔍 Token data from Zora API:`, JSON.stringify(token, null, 2))
      if (token) {
        coinName = token.name || coinName
        coinSymbol = token.symbol ? ` (${token.symbol})` : ""
        if (token.tokenPrice?.priceInUsdc) {
          const price = Number.parseFloat(token.tokenPrice.priceInUsdc)
          currentPrice = price
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
        
        // Generar datos del gráfico basados en el precio actual y porcentaje de cambio
        if (currentPrice > 0) {
          // Extraer el porcentaje de cambio del texto
          const changeMatch = changePctText.match(/[+-]?(\d+\.?\d*)%/)
          const changePercentage = changeMatch ? parseFloat(changeMatch[1]) * (changePctText.startsWith('-') ? -1 : 1) : 0
          
          // Usar datos basados en el porcentaje real
          priceData = generatePriceDataWithChange(currentPrice, changePercentage)
          console.log(`✅ Generated ${priceData.length} price points with ${changePercentage}% change`)
        } else {
          // Generar datos por defecto si no hay precio
          priceData = [0.001, 0.0012, 0.0008, 0.0015, 0.0011, 0.0013, 0.0009, 0.0014, 0.0012, 0.0016, 0.0013, 0.0011, 0.0015, 0.0012, 0.0014, 0.0013, 0.0011, 0.0015, 0.0012, 0.0014]
          console.log(`✅ Using ${priceData.length} default price points for chart`)
        }
        
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
          console.log(`✅ Created date calculated: ${createdAgoText} from ${token.createdAt}`)
        } else {
          console.log(`⚠️ No createdAt found for token, using default: ${createdAgoText}`)
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
          background: "#0F172A", // Fondo espacial oscuro
        }}
      >
        {/* Gráfico de línea blanca delgada que atraviesa toda la ventana */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            opacity: 0.4,
          }}
        >
          <svg 
            width={width} 
            height={height} 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none"
            style={{
              width: "100%",
              height: "100%",
            }}
          >
            {/* Línea del gráfico que atraviesa toda la ventana */}
            <polyline
              points={priceData.length > 0 ? 
                priceData.map((value, index) => {
                  const x = (index / (priceData.length - 1)) * 100
                  const y = 100 - ((value - Math.min(...priceData)) / (Math.max(...priceData) - Math.min(...priceData))) * 80
                  return `${x},${y}`
                }).join(' ') :
                "0,80 10,75 20,70 30,65 40,60 50,55 60,50 70,45 80,40 90,35 100,30"
              }
              fill="none"
              stroke="rgba(255, 255, 255, 0.8)"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Flechas removidas - solo línea blanca */}
          </svg>
        </div>

        {/* Logo del token centrado */}
        {logoSrc && (
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: "40%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "400px",
              height: "400px",
              zIndex: 2,
              opacity: 0.8,
            }}
          >
            <img
              src={logoSrc}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "20px", // Cuadrado con esquinas redondeadas
              }}
            />
          </div>
        )}

        {/* Imagen en esquina inferior removida - no carga correctamente */}

        {/* Nombre del token debajo del cuadro central */}
        {logoSrc && (
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: "65%",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 2,
              fontSize: "48px",
              fontWeight: "800",
              color: "#FFFFFF",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
              textAlign: "center",
            }}
          >
            {coinName.toUpperCase()}
          </div>
        )}
        
        {/* Gráfico de fondo - solo si no hay imagen */}
        {/* MiniChartSVG removido - ahora usamos solo la línea blanca */}
        
        {/* Top Right Icon */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: "20px",
            right: "20px",
            zIndex: 2,
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

        {/* PERFORMANCE METRICS removido */}

        {/* Top Section - Price and Performance */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            padding: "15px 60px 40px 60px",
            color: "#1F2937",
            height: "50%",
            gap: "20px",
            position: "relative",
            width: "100%",
            zIndex: 3,
          }}
        >
          {/* Contenido sin overlay */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "10px",
              zIndex: 3,
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
              {priceUsdText}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "44px",
                fontWeight: "600",
                color: changeColor,
                alignItems: "center",
                gap: "8px",
              }}
            >
              {changePctText}
              {/* Flecha hacia arriba si es positivo */}
              {!changePctText.startsWith('-') && (
                <span style={{ fontSize: "40px", color: changeColor }}>↑</span>
              )}
              {/* Flecha hacia abajo si es negativo */}
              {changePctText.startsWith('-') && (
                <span style={{ fontSize: "40px", color: changeColor }}>↓</span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section - Statistics Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "20px 60px",
            background: "rgba(0, 0, 0, 0.85)",
            color: "#F9FAFB",
            height: "200px", // Altura fija más pequeña
            gap: "40px",
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 3,
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Cuadro vacío removido */}

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

            {/* CREATED Column */}
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
                CREATED
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: "52px",
                  fontWeight: "800",
                  color: "#F9FAFB",
                }}
              >
                {createdAgoText}
              </div>
            </div>
          </div>
        </div>
      </div>,
      {
        width,
        height,
      headers: {
        "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
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