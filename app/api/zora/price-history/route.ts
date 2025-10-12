import { type NextRequest, NextResponse } from "next/server"
import { env } from "@/lib/env"
import { getCache, setCache } from "@/lib/redisCache"

const PRICE_HISTORY_QUERY = `
  query GetTokenPriceHistory($address: String!, $chainId: Int!) {
    zora20Token(
      address: $address
      chainId: $chainId
    ) {
      priceHistory(fillEmptyPeriods: true) {
        closePrice
        highPrice
        lowPrice
        openPrice
        timestamp
      }
    }
  }
`

interface PriceHistoryData {
  closePrice: string
  highPrice: string
  lowPrice: string
  openPrice: string
  timestamp: string
}

interface ZoraPriceHistoryResponse {
  data?: {
    zora20Token?: {
      priceHistory?: PriceHistoryData[]
    }
  }
  errors?: Array<{
    message: string
  }>
}

async function fetchTokenPriceHistory(address: string, chainId: number): Promise<ZoraPriceHistoryResponse> {
  console.log("[v0] Fetching price history for token:", address, "chainId:", chainId)

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  }

  const response = await fetch(env.ZORA_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: PRICE_HISTORY_QUERY,
      variables: {
        address,
        chainId,
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("[v0] API Error:", {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    })
    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
  }

  const data: ZoraPriceHistoryResponse = await response.json()

  if (data.errors && data.errors.length > 0) {
    console.error("[v0] GraphQL errors:", data.errors)
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`)
  }

  return data
}

// Función para agregar datos según timeframe
function aggregateDataByTimeframe(data: any[], timeframe: string) {
  if (timeframe === "ALL") {
    return data // Devolver todos los datos
  }

  const now = Date.now()
  let cutoffTime: number

  switch (timeframe) {
    case "1D":
      cutoffTime = now - (24 * 60 * 60 * 1000) // 24 horas
      break
    case "1W":
      cutoffTime = now - (7 * 24 * 60 * 60 * 1000) // 7 días
      break
    case "1M":
      cutoffTime = now - (30 * 24 * 60 * 60 * 1000) // 30 días
      break
    case "3M":
      cutoffTime = now - (90 * 24 * 60 * 60 * 1000) // 90 días
      break
    case "1Y":
      cutoffTime = now - (365 * 24 * 60 * 60 * 1000) // 365 días
      break
    default:
      return data
  }

  return data.filter(point => {
    const pointTime = point.time * 1000 // Convertir a milliseconds
    return pointTime >= cutoffTime
  })
}

// Función para calcular TTL según timeframe
function getTTLForTimeframe(timeframe: string): number {
  switch (timeframe) {
    case "1D":
      return 5 * 60 // 5 minutos
    case "1W":
      return 30 * 60 // 30 minutos
    case "1M":
      return 2 * 60 * 60 // 2 horas
    case "3M":
      return 6 * 60 * 60 // 6 horas
    case "1Y":
      return 24 * 60 * 60 // 24 horas
    case "ALL":
      return 24 * 60 * 60 // 24 horas
    default:
      return 30 * 60 // 30 minutos por defecto
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get("address")
  const chainId = Number.parseInt(searchParams.get("chainId") || "8453") // Base Mainnet por defecto
  const timeframe = searchParams.get("timeframe") || "ALL"

  if (!address) {
    return NextResponse.json(
      { error: "Address parameter is required" },
      { status: 400 }
    )
  }

  // Generar clave de cache única
  const cacheKey = `price-history:${address.toLowerCase()}:${chainId}:${timeframe}`
  
  // Verificar cache primero
  console.log('🔍 Checking cache for key:', cacheKey)
  const cachedData = await getCache(cacheKey)
  if (cachedData) {
    console.log('✅ Data retrieved from cache:', cacheKey)
    return NextResponse.json({
      ...cachedData,
      cached: true,
      cacheKey
    })
  }

  try {
    console.log("[v0] Fetching price history for:", { address, chainId })
    
    const response = await fetchTokenPriceHistory(address, chainId)

    if (!response.data?.zora20Token) {
      return NextResponse.json({
        success: false,
        error: "Token not found or no price history available",
        data: null
      })
    }

    const priceHistory = response.data.zora20Token.priceHistory || []
    
    console.log("[v0] Received", priceHistory.length, "price history points")

    // Formatear datos para el gráfico
    const allFormattedData = priceHistory.map((point) => {
      const closePrice = parseFloat(point.closePrice);
      const highPrice = parseFloat(point.highPrice);
      const lowPrice = parseFloat(point.lowPrice);
      const openPrice = parseFloat(point.openPrice);
      
      // Verificar si los precios son válidos (no son 0 o NaN)
      const hasValidPrice = closePrice > 0 && !isNaN(closePrice);
      
      return {
        time: new Date(point.timestamp).getTime() / 1000, // Convertir a Unix timestamp
        value: hasValidPrice ? closePrice : 0,
        volume: 0, // No hay datos de volumen en esta API
        high: hasValidPrice ? highPrice : 0,
        low: hasValidPrice ? lowPrice : 0,
        open: hasValidPrice ? openPrice : 0,
        close: hasValidPrice ? closePrice : 0,
        rawData: point,
        hasValidPrice
      }
    }).filter(point => point.hasValidPrice) // Filtrar solo puntos con precios válidos

    // Aplicar filtro de timeframe
    const filteredData = aggregateDataByTimeframe(allFormattedData, timeframe)
    
    console.log(`📊 Data filtered for timeframe ${timeframe}:`, {
      original: allFormattedData.length,
      filtered: filteredData.length
    })

    const responseData = {
      success: true,
      data: response.data,
      chartData: filteredData,
      priceHistoryPoints: filteredData.length,
      timeframe: timeframe,
      message: `Price history data obtained successfully from Zora API (${timeframe})`,
      cached: false,
      cacheKey
    }

    // Guardar en cache con TTL apropiado
    const ttl = getTTLForTimeframe(timeframe)
    await setCache(cacheKey, responseData, ttl)
    console.log(`💾 Data cached for ${ttl}s:`, cacheKey)

    return NextResponse.json(responseData)

  } catch (error) {
    console.error("[v0] Error fetching price history:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch price history",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
