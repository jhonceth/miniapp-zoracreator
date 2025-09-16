export interface TokenFormData {
  name: string
  symbol: string
  description: string
  image: File | null
  currency: "ZORA" | "ETH"
  initialPurchase: string
  payoutRecipient: string
}

export interface CreatedToken {
  address: string
  name: string
  symbol: string
  transactionHash: string
  creatorAddress?: string
  createdAt?: string
  poolAddress?: string
  initialMarketCap?: string
  network?: string
  explorer?: string
  transactionExplorer?: string
  imageUrl?: string
}
