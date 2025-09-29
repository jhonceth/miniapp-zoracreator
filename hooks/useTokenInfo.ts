import { useState, useEffect, useCallback } from 'react';

interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals?: number;
  logo?: string;
}

interface Price {
  usd: number;
  native: number;
  currency: string;
}

interface MarketData {
  marketCap: number;
  fdv: number;
  liquidity: number;
  volume24h: number;
  priceChange24h: number;
}

interface TradingData {
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
}

interface Pool {
  address: string;
  dex: string;
  version?: string;
  baseToken: string;
  quoteToken: string;
  priceUsd: number;
  liquidity: number;
  volume24h: number;
}

interface TokenInfoResponse {
  success: boolean;
  token: TokenInfo;
  price?: Price;
  marketData?: MarketData;
  tradingData?: TradingData;
  pools?: Pool[];
  source: string;
  timestamp: string;
  error?: string;
}

interface UseTokenInfoOptions {
  tokenAddress: string;
  priceOnly?: boolean;
  refreshInterval?: number; // en milisegundos
  enabled?: boolean;
}

interface UseTokenInfoReturn {
  data: TokenInfoResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: string | null;
}

export function useTokenInfo({
  tokenAddress,
  priceOnly = false,
  refreshInterval = 30000, // 30 segundos por defecto
  enabled = true,
}: UseTokenInfoOptions): UseTokenInfoReturn {
  const [data, setData] = useState<TokenInfoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchTokenInfo = useCallback(async () => {
    if (!enabled || !tokenAddress) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        address: tokenAddress,
        ...(priceOnly && { price: 'true' }),
      });

      const response = await fetch(`/api/token-info?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: TokenInfoResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch token info');
      }

      setData(result);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching token info:', err);
    } finally {
      setLoading(false);
    }
  }, [tokenAddress, priceOnly, enabled]);

  useEffect(() => {
    fetchTokenInfo();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchTokenInfo, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchTokenInfo, refreshInterval]);

  return {
    data,
    loading,
    error,
    refetch: fetchTokenInfo,
    lastUpdated,
  };
}
