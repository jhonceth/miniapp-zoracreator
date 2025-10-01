import { type NextRequest, NextResponse } from "next/server"
import type { ZoraCreator, ZoraCreatorCoinsResponse } from "@/lib/types/zora"

const ZORA_GRAPHQL_ENDPOINT = "https://api.zora.co/universal/graphql"

const CREATOR_COINS_QUERY = `
  query GetTopCreatorCoins($first: Int!, $after: String) {
    exploreList(listType: MOST_VALUABLE_CREATORS, first: $first, after: $after) {
      edges {
        node {
          ... on IGraphQLZora20Token {
            id
            name
            symbol
            address
            chainId
            totalSupply
            totalVolume
            volume24h
            marketCap
            uniqueHolders
            creatorAddress
            chainName
            createdAt
            creatorProfile {
              avatar {
                medium
              }
            }
            creatorBalance {
              coinAddress
            }
            creatorEarnings {
              amountUsd
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

async function fetchCreatorCoins(count: number, after?: string): Promise<ZoraCreatorCoinsResponse> {
  console.log("[v0] Fetching creator coins with count:", count, "after:", after)

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  }

  const response = await fetch(ZORA_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: CREATOR_COINS_QUERY,
      variables: {
        first: count,
        after: after || null,
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

  const data: ZoraCreatorCoinsResponse = await response.json()

  if (data.errors && data.errors.length > 0) {
    console.error("[v0] GraphQL errors:", data.errors)
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`)
  }

  return data
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const count = Number.parseInt(searchParams.get("count") || "20")
  const after = searchParams.get("after") || undefined

  try {
    const response = await fetchCreatorCoins(count, after)

    if (!response.data?.exploreList) {
      throw new Error("No data returned from Zora API")
    }

    const edges = response.data.exploreList.edges || []
    console.log("[v0] Received", edges.length, "creator coins")

    const creators: ZoraCreator[] = edges.map((edge) => {
      const node = edge.node
      const marketCap = node.marketCap || "0"
      const volume24h = node.volume24h || "0"
      const totalVolume = node.totalVolume || "0"
      const uniqueHolders = node.uniqueHolders || 0

      return {
        address: node.creatorAddress,
        handle: node.name || `${node.creatorAddress.slice(0, 6)}...${node.creatorAddress.slice(-4)}`,
        avatarUrl: node.creatorProfile?.avatar?.medium || null,
        totalMarketCap: marketCap,
        coinsCount: 1,
        totalVolume24h: volume24h,
        totalVolume: totalVolume,
        uniqueHolders: uniqueHolders,
        topCoins: [
          {
            name: node.name,
            symbol: node.symbol,
            marketCap: marketCap,
            address: node.address, // Agregar la dirección del token
          },
        ],
      }
    })

    return NextResponse.json({
      creators,
      pageInfo: response.data.exploreList.pageInfo,
    })
  } catch (error) {
    console.error("[v0] Error fetching creator coins:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch creator coins",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
