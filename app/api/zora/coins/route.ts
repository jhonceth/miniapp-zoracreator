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
  // For TOP_GAINERS, only require basic data (address and name)
  if (type === "TOP_GAINERS") {
    const hasBasicData = node.address && node.name
    console.log("[v0] TOP_GAINERS validation:", {
      address: node.address,
      name: node.name,
      priceUsd: node.tokenPrice?.priceInUsdc,
      marketCap: node.marketCap,
      isValid: hasBasicData,
    })
    return !!hasBasicData
  }

  // For other types, keep the market cap filter
  const priceUsd = Number.parseFloat(node.tokenPrice?.priceInUsdc || "0")
  const marketCap = Number.parseFloat(node.marketCap || "0")
  return marketCap >= 1000 && priceUsd > 0
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
  const count = Number.parseInt(searchParams.get("count") || "20")
  const after = searchParams.get("after") || undefined

  try {
    console.log("[v0] Fetching coins - type:", type, "count:", count, "after:", after)

    let response

    switch (type) {
      case "TOP_GAINERS":
        response = await getCoinsTopGainers({ count, after })
        break
      case "TOP_VOLUME_24H":
        response = await getCoinsTopVolume24h({ count, after })
        break
      case "MOST_VALUABLE":
        response = await getCoinsMostValuable({ count, after })
        break
      default:
        return NextResponse.json({ error: "Invalid explore type" }, { status: 400 })
    }

    if (!response || !response.data) {
      console.error("[v0] Zora API returned no data:", response)
      return NextResponse.json({ error: "No data returned from Zora API" }, { status: 500 })
    }

    if (response.errors && response.errors.length > 0) {
      console.error("[v0] GraphQL errors:", response.errors)
      return NextResponse.json({ error: "Error fetching data from Zora", details: response.errors }, { status: 500 })
    }

    const allEdges = response.data?.exploreList?.edges || []
    console.log("[v0] Total edges received:", allEdges.length)

    const validEdges = allEdges.filter((edge) => isValidCoin(edge.node, type))
    console.log("[v0] Valid edges after filtering:", validEdges.length)

    const coins = validEdges.map((edge) => mapCoinNode(edge.node))

    console.log("[v0] Successfully fetched and mapped", coins.length, "valid coins for type:", type)

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
