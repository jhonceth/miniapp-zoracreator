import { NextRequest, NextResponse } from 'next/server';
import { getCachedPrice, setCachedPrice, CACHE_KEYS, CACHE_TTL } from '@/lib/priceCache';

interface DexScreenerPair {
  chainId: string;
  dexId: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  txns: {
    m5: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h24: { buys: number; sells: number };
  };
  volume: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  priceChange: {
    m5?: number;
    h1?: number;
    h6?: number;
    h24?: number;
  };
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
  info?: {
    imageUrl?: string;
    header?: string;
    openGraph?: string;
    websites?: Array<{ label: string; url: string }>;
    socials?: Array<{ type: string; url: string }>;
  };
}

interface DexScreenerResponse {
  schemaVersion: string;
  pairs: DexScreenerPair[];
}

interface BlockscoutToken {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  total_supply: string;
  circulating_supply: string;
  exchange_rate: string;
  holders: number;
  tx_count: number;
  transfers_count: number;
}

interface TokenInfoResponse {
  success: boolean;
  token: {
    address: string;
    name: string;
    symbol: string;
    decimals?: number;
    logo?: string;
  };
  price?: {
    usd: number;
    native: number;
    currency: string;
  };
  marketData?: {
    marketCap: number;
    fdv: number;
    liquidity: number;
    volume24h: number;
    priceChange24h: number;
  };
  tradingData?: {
    transactions: {
      m5: { buys: number; sells: number };
      h1: { buys: number; sells: number };
      h6: { buys: number; sells: number };
      h24: { buys: number; sells: number };
    };
    volume: {
      m5: number;
      h1: number;
      h6: number;
      h24: number;
    };
  };
  pools?: Array<{
    address: string;
    dex: string;
    version?: string;
    baseToken: string;
    quoteToken: string;
    priceUsd: number;
    liquidity: number;
    volume24h: number;
  }>;
  source: string;
  timestamp: string;
  error?: string;
}

async function fetchFromDexScreener(tokenAddress: string): Promise<TokenInfoResponse | null> {
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LaunchCoin/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`DexScreener API error: ${response.status}`);
    }

    const data: DexScreenerResponse = await response.json();
    
    if (!data.pairs || data.pairs.length === 0) {
      return null;
    }

    // Encontrar el pool con mayor liquidez
    const bestPool = data.pairs.reduce((best, current) => 
      current.liquidity.usd > best.liquidity.usd ? current : best
    );

    // Calcular datos agregados de todos los pools
    const totalLiquidity = data.pairs.reduce((sum, pool) => sum + pool.liquidity.usd, 0);
    const totalVolume24h = data.pairs.reduce((sum, pool) => sum + pool.volume.h24, 0);
    const avgPriceChange24h = data.pairs.reduce((sum, pool) => sum + (pool.priceChange.h24 || 0), 0) / data.pairs.length;

    const response_data: TokenInfoResponse = {
      success: true,
      token: {
        address: tokenAddress,
        name: bestPool.baseToken.name,
        symbol: bestPool.baseToken.symbol,
        logo: bestPool.info?.imageUrl,
      },
      price: {
        usd: parseFloat(bestPool.priceUsd),
        native: parseFloat(bestPool.priceNative),
        currency: bestPool.quoteToken.symbol,
      },
      marketData: {
        marketCap: bestPool.marketCap,
        fdv: bestPool.fdv,
        liquidity: totalLiquidity,
        volume24h: totalVolume24h,
        priceChange24h: avgPriceChange24h,
      },
      tradingData: {
        transactions: {
          m5: { buys: bestPool.txns.m5.buys, sells: bestPool.txns.m5.sells },
          h1: { buys: bestPool.txns.h1.buys, sells: bestPool.txns.h1.sells },
          h6: { buys: bestPool.txns.h6.buys, sells: bestPool.txns.h6.sells },
          h24: { buys: bestPool.txns.h24.buys, sells: bestPool.txns.h24.sells },
        },
        volume: {
          m5: bestPool.volume.m5,
          h1: bestPool.volume.h1,
          h6: bestPool.volume.h6,
          h24: bestPool.volume.h24,
        },
      },
      pools: data.pairs.map(pool => ({
        address: pool.pairAddress,
        dex: pool.dexId,
        version: (pool as any).labels?.[0] || 'v2',
        baseToken: pool.baseToken.symbol,
        quoteToken: pool.quoteToken.symbol,
        priceUsd: parseFloat(pool.priceUsd),
        liquidity: pool.liquidity.usd,
        volume24h: pool.volume.h24,
      })),
      source: 'dexscreener',
      timestamp: new Date().toISOString(),
    };

    return response_data;
  } catch (error) {
    console.error('DexScreener API error:', error);
    return null;
  }
}

async function fetchFromBlockscout(tokenAddress: string): Promise<TokenInfoResponse | null> {
  try {
    const response = await fetch(`https://base.blockscout.com/api/v2/tokens/${tokenAddress}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LaunchCoin/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Blockscout API error: ${response.status}`);
    }

    const data: BlockscoutToken = await response.json();

    const response_data: TokenInfoResponse = {
      success: true,
      token: {
        address: tokenAddress,
        name: data.name,
        symbol: data.symbol,
        decimals: data.decimals,
      },
      source: 'blockscout',
      timestamp: new Date().toISOString(),
    };

    return response_data;
  } catch (error) {
    console.error('Blockscout API error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenAddress = searchParams.get('address');
  const priceOnly = searchParams.get('price') === 'true';

  if (!tokenAddress) {
    return NextResponse.json(
      { success: false, error: 'Token address is required' },
      { status: 400 }
    );
  }

  // Verificar cache primero
  const cacheKey = CACHE_KEYS.TOKEN_INFO(tokenAddress);
  const cachedData = await getCachedPrice(cacheKey);
  if (cachedData) {
    return NextResponse.json(cachedData, {
      headers: {
        'Cache-Control': 'public, max-age=20', // Cache for 20 seconds
        'X-Cache': 'HIT',
      },
    });
  }

  // Intentar DexScreener primero
  let result = await fetchFromDexScreener(tokenAddress);
  
  // Si DexScreener falla, usar Blockscout como fallback
  if (!result) {
    console.log(`DexScreener failed for ${tokenAddress}, trying Blockscout...`);
    result = await fetchFromBlockscout(tokenAddress);
  }

  if (!result) {
    return NextResponse.json(
      { success: false, error: 'Both APIs failed to fetch token data' },
      { status: 503 }
    );
  }

  // Si solo se solicita precio, devolver solo esa información
  if (priceOnly) {
    const priceOnlyResult = {
      success: true,
      token: result.token,
      price: result.price,
      marketData: result.marketData,
      source: result.source,
      timestamp: result.timestamp,
    };
    
    // Guardar en cache por 20 segundos
    await setCachedPrice(cacheKey, priceOnlyResult, CACHE_TTL.PRICES);
    
    return NextResponse.json(priceOnlyResult, {
      headers: {
        'Cache-Control': 'public, max-age=20',
        'X-Cache': 'MISS',
      },
    });
  }

  // Guardar resultado completo en cache por 30 segundos
  await setCachedPrice(cacheKey, result, CACHE_TTL.TOKEN_INFO);

  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'public, max-age=20',
      'X-Cache': 'MISS',
    },
  });
}
