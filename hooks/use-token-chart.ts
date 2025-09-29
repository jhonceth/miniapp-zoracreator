// 🎯 HOOK REACT PARA USO FÁCIL DEL SISTEMA MODULAR
// Hook personalizado para obtener datos de gráficos de tokens

import { useState, useEffect } from 'react';
import { getTokenChartData, type TokenChartResponse } from '@/lib/graphql-modular';

interface UseTokenChartOptions {
  timeframe?: string;
  preferredBaseTokens?: string[];
  network?: string;
  enabled?: boolean;
}

interface UseTokenChartReturn {
  response: TokenChartResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTokenChart(
  tokenAddress: string, 
  options: UseTokenChartOptions = {}
): UseTokenChartReturn {
  const {
    timeframe = '1M',
    preferredBaseTokens = ['ZORA', 'WETH', 'USDC', 'USDT'],
    network = 'base',
    enabled = true
  } = options;

  const [response, setResponse] = useState<TokenChartResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!tokenAddress || !enabled) return;

    setLoading(true);
    setError(null);

    try {
      console.log(`🔄 Fetching chart data for ${tokenAddress} with timeframe ${timeframe}`);
      
      const result = await getTokenChartData(
        tokenAddress, 
        timeframe, 
        preferredBaseTokens, 
        network,
        undefined // apiKey - se obtiene del servidor
      );

      setResponse(result);
      
      if (!result.success) {
        setError(result.error || 'Error desconocido');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('❌ Error en useTokenChart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tokenAddress, timeframe, network, enabled]);

  const refetch = () => {
    fetchData();
  };

  return {
    response,
    loading,
    error,
    refetch
  };
}

// ===== HOOK PARA MÚLTIPLES TOKENS =====

interface UseMultipleTokenChartsOptions {
  timeframe?: string;
  preferredBaseTokens?: string[];
  network?: string;
  enabled?: boolean;
}

interface UseMultipleTokenChartsReturn {
  responses: Record<string, TokenChartResponse | null>;
  loading: Record<string, boolean>;
  errors: Record<string, string | null>;
  refetch: (tokenAddress?: string) => void;
  refetchAll: () => void;
}

export function useMultipleTokenCharts(
  tokenAddresses: string[],
  options: UseMultipleTokenChartsOptions = {}
): UseMultipleTokenChartsReturn {
  const {
    timeframe = '1M',
    preferredBaseTokens = ['ZORA', 'WETH', 'USDC', 'USDT'],
    network = 'base',
    enabled = true
  } = options;

  const [responses, setResponses] = useState<Record<string, TokenChartResponse | null>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const fetchTokenData = async (tokenAddress: string) => {
    if (!enabled) return;

    setLoading(prev => ({ ...prev, [tokenAddress]: true }));
    setErrors(prev => ({ ...prev, [tokenAddress]: null }));

    try {
      console.log(`🔄 Fetching chart data for ${tokenAddress} with timeframe ${timeframe}`);
      
      const result = await getTokenChartData(
        tokenAddress, 
        timeframe, 
        preferredBaseTokens, 
        network,
        undefined // apiKey - se obtiene del servidor
      );

      setResponses(prev => ({ ...prev, [tokenAddress]: result }));
      
      if (!result.success) {
        setErrors(prev => ({ ...prev, [tokenAddress]: result.error || 'Error desconocido' }));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setErrors(prev => ({ ...prev, [tokenAddress]: errorMessage }));
      console.error(`❌ Error en useMultipleTokenCharts para ${tokenAddress}:`, err);
    } finally {
      setLoading(prev => ({ ...prev, [tokenAddress]: false }));
    }
  };

  useEffect(() => {
    if (enabled && tokenAddresses.length > 0) {
      // Fetch data for all tokens
      tokenAddresses.forEach(tokenAddress => {
        fetchTokenData(tokenAddress);
      });
    }
  }, [tokenAddresses.join(','), timeframe, network, enabled]);

  const refetch = (tokenAddress?: string) => {
    if (tokenAddress) {
      fetchTokenData(tokenAddress);
    } else {
      // Refetch all
      tokenAddresses.forEach(addr => fetchTokenData(addr));
    }
  };

  const refetchAll = () => {
    tokenAddresses.forEach(addr => fetchTokenData(addr));
  };

  return {
    responses,
    loading,
    errors,
    refetch,
    refetchAll
  };
}

// ===== HOOK PARA TIMEFRAME SELECTOR =====

interface UseTimeframeSelectorReturn {
  currentTimeframe: string;
  availableTimeframes: string[];
  setTimeframe: (timeframe: string) => void;
  isTimeframeValid: (timeframe: string) => boolean;
}

export function useTimeframeSelector(initialTimeframe: string = '1M'): UseTimeframeSelectorReturn {
  const [currentTimeframe, setCurrentTimeframe] = useState(initialTimeframe);

  const availableTimeframes = ['1H', '1D', '1W', '1M', '3M', '1Y', 'ALL'];

  const isTimeframeValid = (timeframe: string): boolean => {
    return availableTimeframes.includes(timeframe);
  };

  const setTimeframe = (timeframe: string) => {
    if (isTimeframeValid(timeframe)) {
      setCurrentTimeframe(timeframe);
    } else {
      console.warn(`⚠️ Timeframe inválido: ${timeframe}`);
    }
  };

  return {
    currentTimeframe,
    availableTimeframes,
    setTimeframe,
    isTimeframeValid
  };
}

// ===== EXPORTAR TIPOS =====

export type { UseTokenChartOptions, UseTokenChartReturn, UseMultipleTokenChartsOptions, UseMultipleTokenChartsReturn, UseTimeframeSelectorReturn };
