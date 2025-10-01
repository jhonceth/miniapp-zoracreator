import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Fetch ETH and ZORA prices from CoinGecko
    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum,zora&vs_currencies=usd", {
      next: { revalidate: 30 }, // Cache for 30 seconds
    })

    if (!response.ok) {
      throw new Error("Failed to fetch prices")
    }

    const data = await response.json()

    return NextResponse.json({
      eth: data.ethereum?.usd || 0,
      zora: data.zora?.usd || 0,
    })
  } catch (error) {
    console.error("Error fetching prices:", error)
    // Return fallback prices if API fails
    return NextResponse.json({
      eth: 4100,
      zora: 0.005,
    })
  }
}
