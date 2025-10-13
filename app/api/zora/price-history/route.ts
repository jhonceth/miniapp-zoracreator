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

// Función para hacer delay
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Función para extraer tiempo de retry del error 429
function extractRetryAfter(errorBody: string): number {
  try {
    const parsed = JSON.parse(errorBody)
    if (parsed.detail && parsed.detail.includes('try again after')) {
      const match = parsed.detail.match(/try again after (\d+\.?\d*) seconds/)
      if (match) {
        return Math.ceil(parseFloat(match[1]) * 1000) // Convertir a ms y redondear hacia arriba
      }
    }
  } catch (e) {
    // Si no se puede parsear, usar delay por defecto
  }
  return 3000 // 3 segundos por defecto
}

async function fetchTokenPriceHistory(address: string, chainId: number, retryCount = 0): Promise<ZoraPriceHistoryResponse> {
  const maxRetries = 3
  console.log(`[v0] Fetching price history for token: ${address}, chainId: ${chainId}, attempt: ${retryCount + 1}`)

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  }

  try {
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
      
      // Manejar rate limiting (429)
      if (response.status === 429 && retryCount < maxRetries) {
        const retryAfter = extractRetryAfter(errorText)
        console.log(`[v0] Rate limit exceeded, retrying after ${retryAfter}ms (attempt ${retryCount + 1}/${maxRetries})`)
        await delay(retryAfter)
        return fetchTokenPriceHistory(address, chainId, retryCount + 1)
      }
      
      console.error("[v0] API Error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        retryCount
      })
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
    }

    const data: ZoraPriceHistoryResponse = await response.json()

    if (data.errors && data.errors.length > 0) {
      console.error("[v0] GraphQL errors:", data.errors)
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`)
    }

    return data
  } catch (error) {
    // Re-throw si es el último intento
    if (retryCount >= maxRetries) {
      throw error
    }
    
    // Retry con backoff exponencial para otros errores
    const backoffDelay = Math.pow(2, retryCount) * 1000 // 1s, 2s, 4s
    console.log(`[v0] Request failed, retrying after ${backoffDelay}ms (attempt ${retryCount + 1}/${maxRetries})`)
    await delay(backoffDelay)
    return fetchTokenPriceHistory(address, chainId, retryCount + 1)
  }
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
      console.log("[v0] Token not found in Zora API:", { address, chainId })
      return NextResponse.json({
        success: false,
        error: "Token not found or no price history available. This token may be too new or have limited trading activity.",
        data: null,
        chartData: []
      })
    }

    const priceHistory = response.data.zora20Token.priceHistory || []
    
    console.log("[v0] Received", priceHistory.length, "price history points")
    
    if (priceHistory.length === 0) {
      console.log("[v0] No price history data available for token:", { address, chainId })
      return NextResponse.json({
        success: false,
        error: "No price history data available for this token. This token may be too new or have limited trading activity.",
        data: response.data,
        chartData: []
      })
    }

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
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    
    // Detectar si es un error de rate limiting
    const isRateLimitError = errorMessage.includes('429') || errorMessage.includes('Ratelimit exceeded')
    
    return NextResponse.json(
      {
        success: false,
        error: isRateLimitError 
          ? "Rate limit exceeded. Please try again in a few moments."
          : `Failed to fetch price history: ${errorMessage}`,
        details: errorMessage,
        chartData: [],
        isRateLimit: isRateLimitError
      },
      { status: isRateLimitError ? 429 : 500 }
    )
  }
}
