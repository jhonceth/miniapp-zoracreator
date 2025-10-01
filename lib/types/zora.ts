export interface ZoraTokenPrice {
  priceInUsdc?: string
  currencyAddress: string
  priceInPoolToken: string
}

export interface ZoraCreatorProfile {
  id: string
  handle: string
  avatar?: {
    previewImage: {
      blurhash?: string
      medium: string
      small: string
    }
  }
}

export interface ZoraMediaContent {
  mimeType?: string
  originalUri: string
  previewImage?: {
    small: string
    medium: string
    blurhash?: string
  }
}

export interface ZoraCoinNode {
  id: string
  name: string
  symbol: string
  address: string
  description: string
  tokenPrice?: ZoraTokenPrice
  marketCap: string
  marketCapDelta24h: string
  volume24h: string
  totalVolume: string
  totalSupply: string
  uniqueHolders: number
  chainId: number
  createdAt?: string
  creatorAddress?: string
  creatorProfile?: ZoraCreatorProfile
  mediaContent?: ZoraMediaContent
  tokenUri?: string
}

export interface ZoraCoin {
  address: string
  name: string
  symbol: string
  imageUrl: string | null
  marketCap: string
  volume24h: string
  marketCapDelta24h: string | null
  priceUsd: string
  uniqueHolders: number
  createdAt: string
  changePercent24h: number | null
}

export interface ZoraExploreResponse {
  data?: {
    exploreList?: {
      edges: Array<{
        node: ZoraCoinNode
        cursor: string
      }>
      pageInfo: {
        hasNextPage: boolean
        endCursor: string | null
      }
    }
  }
  errors?: Array<{
    message: string
  }>
}

export type ExploreType = "TOP_GAINERS" | "TOP_VOLUME_24H" | "MOST_VALUABLE"

export interface ZoraCreator {
  address: string
  handle: string
  avatarUrl: string | null
  totalMarketCap: string
  coinsCount: number
  totalVolume24h: string
  totalVolume: string
  uniqueHolders: number
  topCoins: Array<{
    name: string
    symbol: string
    marketCap: string
    address: string
  }>
}

export interface ZoraCreatorCoinNode {
  id: string
  name: string
  symbol: string
  address: string
  chainId: number
  totalSupply: string
  totalVolume: string
  volume24h: string
  marketCap: string
  uniqueHolders: number
  creatorAddress: string
  creatorBalance: {
    coinAddress: string
    creatorCurrentBalance: string
  }
  creatorEarnings: Array<{
    amountUsd: string
  }>
  chainName: string
  createdAt: string
  creatorProfile: {
    avatar?: {
      medium: string
    }
  }
}

export interface ZoraCreatorCoinsResponse {
  data?: {
    exploreList?: {
      edges: Array<{
        node: ZoraCreatorCoinNode
      }>
      pageInfo: {
        hasNextPage: boolean
        endCursor: string | null
      }
    }
  }
  errors?: Array<{
    message: string
  }>
}
