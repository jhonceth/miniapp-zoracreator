import { type NextRequest, NextResponse } from "next/server"
import { getCoinsTopGainers, getCoinsTopVolume24h, getCoinsMostValuable, setApiKey } from "@zoralabs/coins-sdk"
import type { ZoraCoin, ZoraCoinNode } from "@/lib/types/zora"

if (process.env.ZORA_API_KEY) {
  setApiKey(process.env.ZORA_API_KEY)
}

function calculateChangePercent(marketCap: string, marketCapDelta24h: string): number | null {
  const currentMarketCap = Number.parseFloat(marketCap)
  const delta = Number.parseFloat(marketCapDelta24h)

  if (isNaN(currentMarketCap) || isNaN(delta) || currentMarketCap === 0) {
    return null
  }

  const previousMarketCap = currentMarketCap - delta

  if (previousMarketCap === 0) {
    return null
  }

  const changePercent = (delta / previousMarketCap) * 100

  return changePercent
}

function isValidCoin(node: ZoraCoinNode, type: string): boolean {
  // Basic validation for all types
  const hasBasicData = node.address && node.name && node.symbol
  
  if (!hasBasicData) {
    console.log("[v0] Invalid coin - missing basic data:", {
      address: node.address,
      name: node.name,
      symbol: node.symbol,
    })
    return false
  }

  // Check for valid price and market cap data
  const priceUsd = Number.parseFloat(node.tokenPrice?.priceInUsdc || "0")
  const marketCap = Number.parseFloat(node.marketCap || "0")
  const volume24h = Number.parseFloat(node.volume24h || "0")
  
  // Filter out coins with zero or invalid data
  const hasValidPrice = priceUsd > 0
  const hasValidMarketCap = marketCap > 0
  const hasValidVolume = volume24h > 0
  
  // For TOP_GAINERS, require at least a valid price or market cap
  if (type === "TOP_GAINERS") {
    const isValid = hasValidPrice || hasValidMarketCap
    console.log("[v0] TOP_GAINERS validation:", {
      address: node.address,
      name: node.name,
      priceUsd,
      marketCap,
      volume24h,
      isValid,
    })
    return isValid
  }

  // For other types, require valid price AND market cap
  const isValid = hasValidPrice && hasValidMarketCap
  
  console.log("[v0] Validation for", type, ":", {
    address: node.address,
    name: node.name,
    priceUsd,
    marketCap,
    volume24h,
    isValid,
  })
  
  return isValid
}

function mapCoinNode(node: ZoraCoinNode): ZoraCoin {
  const imageUrl =
    node.mediaContent?.previewImage?.small ||
    node.mediaContent?.previewImage?.medium ||
    node.creatorProfile?.avatar?.previewImage?.small ||
    null

  const priceUsd = node.tokenPrice?.priceInUsdc || "0"
  const changePercent24h = calculateChangePercent(node.marketCap, node.marketCapDelta24h)

  return {
    address: node.address,
    name: node.name,
    symbol: node.symbol,
    imageUrl,
    marketCap: node.marketCap,
    volume24h: node.volume24h,
    marketCapDelta24h: node.marketCapDelta24h,
    priceUsd,
    uniqueHolders: node.uniqueHolders,
    createdAt: node.createdAt || "",
    changePercent24h,
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get("type") || "TOP_GAINERS"
  const requestedCount = Number.parseInt(searchParams.get("count") || "20")
  const after = searchParams.get("after") || undefined
  
  // Request more data to compensate for filtering
  const fetchCount = Math.max(requestedCount * 3, 60)

  try {
    console.log("[v0] Fetching coins - type:", type, "requested:", requestedCount, "fetching:", fetchCount, "after:", after)

    let response

    switch (type) {
      case "TOP_GAINERS":
        response = await getCoinsTopGainers({ count: fetchCount, after })
        break
      case "TOP_VOLUME_24H":
        response = await getCoinsTopVolume24h({ count: fetchCount, after })
        break
      case "MOST_VALUABLE":
        response = await getCoinsMostValuable({ count: fetchCount, after })
        break
      default:
        return NextResponse.json({ error: "Invalid explore type" }, { status: 400 })
    }

    if (!response || !response.data) {
      console.error("[v0] Zora API returned no data:", response)
      return NextResponse.json({ error: "No data returned from Zora API" }, { status: 500 })
    }

    if ((response as any).errors && (response as any).errors.length > 0) {
      console.error("[v0] GraphQL errors:", (response as any).errors)
      return NextResponse.json({ error: "Error fetching data from Zora", details: (response as any).errors }, { status: 500 })
    }

    const allEdges = response.data?.exploreList?.edges || []
    console.log("[v0] Total edges received:", allEdges.length)
    
    // Log raw data structure for debugging
    if (allEdges.length > 0) {
      console.log("[v0] Raw node data structure:", JSON.stringify(allEdges[0].node, null, 2))
    }

    const validEdges = allEdges.filter((edge) => isValidCoin(edge.node, type))
    console.log("[v0] Valid edges after filtering:", validEdges.length)

    const allCoins = validEdges.map((edge) => mapCoinNode(edge.node))
    
    // Limit to requested count
    const coins = allCoins.slice(0, requestedCount)

    console.log("[v0] Successfully fetched and mapped", allCoins.length, "valid coins, returning", coins.length, "for type:", type)

    return NextResponse.json({
      coins,
      pageInfo: response.data?.exploreList?.pageInfo,
    })
  } catch (error) {
    console.error("[v0] Error fetching Zora data:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch coins data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
