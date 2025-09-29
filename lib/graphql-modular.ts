// 🎯 SISTEMA MODULAR DE BÚSQUEDAS EN POOLS Y GRAPH
// Implementación completa con múltiples timeframes y agregaciones

// ===== TIPOS Y CONFIGURACIONES =====

interface TimeframeConfig {
  days: number;
  interval: 'hourly' | 'daily' | 'weekly' | 'monthly';
  entity: 'poolHourData' | 'poolDayData';
  dateField: 'periodStartUnix' | 'date';
}

const TIMEFRAMES: Record<string, TimeframeConfig> = {
  '1H': { days: 1, interval: 'hourly', entity: 'poolHourData', dateField: 'periodStartUnix' },
  '1D': { days: 1, interval: 'hourly', entity: 'poolHourData', dateField: 'periodStartUnix' },
  '1W': { days: 7, interval: 'daily', entity: 'poolDayData', dateField: 'date' },
  '1M': { days: 30, interval: 'daily', entity: 'poolDayData', dateField: 'date' },
  '3M': { days: 90, interval: 'daily', entity: 'poolDayData', dateField: 'date' },
  '1Y': { days: 365, interval: 'weekly', entity: 'poolDayData', dateField: 'date' },
  'ALL': { days: 365 * 5, interval: 'monthly', entity: 'poolDayData', dateField: 'date' }
};

interface PoolData {
  id: string;
  token0: {
    id: string;
    symbol: string;
    name: string;
    derivedETH: string;
  };
  token1: {
    id: string;
    symbol: string;
    name: string;
    derivedETH: string;
  };
  totalValueLockedUSD: string;
  volumeUSD: string;
  poolDayData?: any[];
  poolHourData?: any[];
}

interface FormattedChartData {
  time: string | number;
  value: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  close: number;
  rawData: any;
}

interface TokenChartResponse {
  success: boolean;
  data: {
    bundle: { ethPriceUSD: string };
    pools: PoolData[];
    timeframe?: string;
    metadata?: {
      selectedPool?: string;
      baseToken?: string;
      calculationMethod?: string;
    };
  };
  chartData?: FormattedChartData[];
  error?: string;
}

// ===== CONFIGURACIÓN GRAPHQL =====

const getGraphQLConfig = (network: string, apiKey?: string) => {
  // Si no hay API key, usar endpoint público
  if (!apiKey || apiKey.trim() === '') {
    return {
      url: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
      apiKey: ''
    };
  }
  
  const configs = {
    base: {
      url: 'https://gateway.thegraph.com/api/subgraphs/id/7SP2t3PQd7LX19riCfwX5znhFdULjwRofQZtRZMJ8iW8',
      apiKey: apiKey
    },
    ethereum: {
      url: 'https://gateway.thegraph.com/api/subgraphs/id/7SP2t3PQd7LX19riCfwX5znhFdULjwRofQZtRZMJ8iW8',
      apiKey: apiKey
    }
  };
  
  return configs[network as keyof typeof configs] || configs.base;
};

// ===== CONSULTA GRAPHQL DINÁMICA =====

const GET_TOKEN_DATA = `
  query GetTokenData($tokenAddress: String!, $timeframe: String!, $timestamp: Int!, $shouldIncludeDaily: Boolean!, $shouldIncludeHourly: Boolean!) {
    pools(
      where: {
        or: [
          {token0: $tokenAddress},
          {token1: $tokenAddress}
        ]
      },
      first: 10,
      orderBy: totalValueLockedUSD,
      orderDirection: desc
    ) {
      id
      token0 { 
        id
        symbol
        name
        derivedETH
      }
      token1 { 
        id
        symbol  
        name
        derivedETH
      }
      totalValueLockedUSD
      volumeUSD
      
      # Datos históricos DINÁMICOS según timeframe
      poolDayData(
        where: {date_gte: $timestamp},
        first: 1000,
        orderBy: date,
        orderDirection: asc
      ) @include(if: $shouldIncludeDaily) {
        date
        volumeUSD
        token0Price
        token1Price
        high
        low
        open
        close
        feesUSD
        txCount
      }
      
      poolHourData(
        where: {periodStartUnix_gte: $timestamp},
        first: 1000,
        orderBy: periodStartUnix,
        orderDirection: asc
      ) @include(if: $shouldIncludeHourly) {
        periodStartUnix
        volumeUSD
        token0Price
        token1Price
        high
        low
        open
        close
        feesUSD
        txCount
      }
    }
    
    bundle(id: "1") {
      ethPriceUSD
    }
  }
`;

// ===== FUNCIONES DE PROCESAMIENTO =====

async function graphqlRequest(query: string, variables: any, network: string = 'base', apiKey?: string) {
  const config = getGraphQLConfig(network, apiKey);
  
  // Preparar headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Solo agregar Authorization si hay API key
  if (config.apiKey && config.apiKey.trim() !== '') {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }
  
  console.log('🔍 GraphQL Request:', {
    url: config.url,
    hasApiKey: !!config.apiKey,
    headers: Object.keys(headers)
  });
  
  const response = await fetch(config.url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query,
      variables
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ GraphQL Error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  
  if (result.errors) {
    console.error('❌ GraphQL Query Errors:', result.errors);
    throw new Error(result.errors[0].message);
  }

  return result.data;
}

function findBestPool(pools: PoolData[], preferredBaseTokens: string[] = ['USDC', 'WETH', 'USDT', 'ZORA']): PoolData | null {
  if (!pools || pools.length === 0) return null;

  // Filtrar pools con datos históricos y liquidez mínima
  const eligiblePools = pools.filter(pool => {
    const hasData = (pool.poolDayData?.length || 0) > 0 || (pool.poolHourData?.length || 0) > 0;
    const hasLiquidity = parseFloat(pool.totalValueLockedUSD || '0') > 10; // Mínimo $10 TVL
    const hasVolume = parseFloat(pool.volumeUSD || '0') > 0;
    return hasData && hasLiquidity && hasVolume;
  });

  if (!eligiblePools.length) return null;

  // Calcular score para cada pool
  const scoredPools = eligiblePools.map(pool => ({
    pool,
    score: calculatePoolScore(pool, preferredBaseTokens)
  }));

  // Ordenar por score descendente
  scoredPools.sort((a, b) => b.score - a.score);
  
  console.log('🏆 Pool scores:', scoredPools.map(p => ({
    id: p.pool.id.slice(0, 8) + '...',
    tokens: `${p.pool.token0.symbol}/${p.pool.token1.symbol}`,
    score: Math.round(p.score),
    tvl: parseFloat(p.pool.totalValueLockedUSD).toFixed(2),
    volume: parseFloat(p.pool.volumeUSD).toFixed(2)
  })));

  return scoredPools[0]?.pool || null;
}

function calculatePoolScore(pool: PoolData, preferredBaseTokens: string[]): number {
  let score = 0;

  // Puntuación base por TVL y volumen (VOLUMEN TIENE MÁS PESO)
  const tvl = parseFloat(pool.totalValueLockedUSD || '0');
  const volume = parseFloat(pool.volumeUSD || '0');
  
  score += tvl * 0.001; // TVL score
  score += volume * 0.1; // Volume score (10x más peso que antes)

  // Bonus por tokens preferidos (REDUCIDO)
  const token0Symbol = pool.token0.symbol.toUpperCase();
  const token1Symbol = pool.token1.symbol.toUpperCase();
  
  // Prioridad por orden de preferencia (REDUCIDO)
  const token0Index = preferredBaseTokens.indexOf(token0Symbol);
  const token1Index = preferredBaseTokens.indexOf(token1Symbol);
  
  if (token0Index !== -1) {
    score += (preferredBaseTokens.length - token0Index) * 100; // Reducido de 1000 a 100
  }
  if (token1Index !== -1) {
    score += (preferredBaseTokens.length - token1Index) * 100; // Reducido de 1000 a 100
  }

  // Bonus extra por USDC (REDUCIDO)
  if (token0Symbol === 'USDC' || token1Symbol === 'USDC') {
    score += 50; // Reducido de 500 a 50
  }

  // Bonus por WETH (REDUCIDO)
  if (token0Symbol === 'WETH' || token1Symbol === 'WETH') {
    score += 30; // Reducido de 300 a 30
  }

  // Bonus por datos históricos
  const historicalData = pool.poolDayData || pool.poolHourData || [];
  score += historicalData.length * 10;

  // Penalización por derivedETH = 0
  const token0DerivedETH = parseFloat(pool.token0.derivedETH || '0');
  const token1DerivedETH = parseFloat(pool.token1.derivedETH || '0');
  
  if (token0DerivedETH === 0 || token1DerivedETH === 0) {
    score -= 200;
  }

  // Bonus por derivedETH válido
  if (token0DerivedETH > 0) score += 50;
  if (token1DerivedETH > 0) score += 50;

  return Math.max(score, 0);
}

function getBaseToken(pool: PoolData, targetTokenAddress: string) {
  const isToken0Target = pool.token0.id.toLowerCase() === targetTokenAddress.toLowerCase();
  return isToken0Target ? pool.token1 : pool.token0;
}

function processTimeframeData(
  data: any[],
  pool: PoolData,
  ethPriceUSD: string,
  config: TimeframeConfig,
  targetTokenAddress: string
): FormattedChartData[] {
  const isToken0Target = pool.token0.id.toLowerCase() === targetTokenAddress.toLowerCase();
  const baseToken = isToken0Target ? pool.token1 : pool.token0;
  const priceField = isToken0Target ? 'token1Price' : 'token0Price';
  const dateField = config.dateField;

  // Procesar datos base
  let processed = data.map(item => {
    const rawPrice = parseFloat(item[priceField]);
    const baseTokenETH = parseFloat(baseToken.derivedETH);
    const ethUSD = parseFloat(ethPriceUSD);
    
    return {
      time: item[dateField],
      value: rawPrice * baseTokenETH * ethUSD,
      volume: parseFloat(item.volumeUSD),
      high: parseFloat(item.high) * baseTokenETH * ethUSD,
      low: parseFloat(item.low) * baseTokenETH * ethUSD,
      open: parseFloat(item.open) * baseTokenETH * ethUSD,
      close: parseFloat(item.close) * baseTokenETH * ethUSD,
      rawData: item
    };
  });

  // Aplicar agregaciones según timeframe
  if (config.interval === 'weekly') {
    processed = aggregateWeekly(processed);
  } else if (config.interval === 'monthly') {
    processed = aggregateMonthly(processed);
  }

  return processed;
}

// ===== FUNCIONES DE AGREGACIÓN =====

function aggregateWeekly(dailyData: FormattedChartData[]): FormattedChartData[] {
  const weeklyMap = new Map<number, FormattedChartData>();
  
  dailyData.forEach(day => {
    const date = new Date(Number(day.time) * 1000);
    const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
    const weekKey = Math.floor(weekStart.getTime() / 1000);
    
    if (!weeklyMap.has(weekKey)) {
      weeklyMap.set(weekKey, {
        time: weekKey,
        value: 0, 
        open: day.open, 
        high: day.high, 
        low: day.low, 
        close: day.close,
        volume: 0, 
        rawData: day.rawData
      });
    }
    
    const week = weeklyMap.get(weekKey)!;
    week.close = day.close; // Último precio de la semana
    week.high = Math.max(week.high, day.high);
    week.low = Math.min(week.low, day.low);
    week.volume += day.volume;
  });
  
  return Array.from(weeklyMap.values());
}

function aggregateMonthly(dailyData: FormattedChartData[]): FormattedChartData[] {
  const monthlyMap = new Map<string, FormattedChartData>();
  
  dailyData.forEach(day => {
    const date = new Date(Number(day.time) * 1000);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, {
        time: day.time,
        value: 0, 
        open: day.open, 
        high: day.high, 
        low: day.low, 
        close: day.close,
        volume: 0, 
        rawData: day.rawData
      });
    }
    
    const month = monthlyMap.get(monthKey)!;
    month.close = day.close;
    month.high = Math.max(month.high, day.high);
    month.low = Math.min(month.low, day.low);
    month.volume += day.volume;
  });
  
  return Array.from(monthlyMap.values());
}

// ===== FUNCIÓN PRINCIPAL MODULAR =====

export async function getTokenChartData(
  tokenAddress: string, 
  timeframe: string = '1M',
  preferredBaseTokens: string[] = ['USDC', 'WETH', 'USDT', 'ZORA'],
  network: string = 'base',
  apiKey?: string
): Promise<TokenChartResponse> {
  try {
    const config = TIMEFRAMES[timeframe] || TIMEFRAMES['1M'];
    const timestamp = Math.floor(Date.now() / 1000) - (config.days * 24 * 60 * 60);

    console.log(`🎯 Obteniendo datos para ${tokenAddress} con timeframe ${timeframe}`);

    // 1. Obtener datos brutos
    const rawData = await graphqlRequest(GET_TOKEN_DATA, {
      tokenAddress,
      timeframe,
      timestamp,
      shouldIncludeDaily: config.entity === 'poolDayData',
      shouldIncludeHourly: config.entity === 'poolHourData'
    }, network, apiKey);

    if (!rawData.pools || rawData.pools.length === 0) {
      return {
        success: false,
        data: rawData,
        error: 'No trading pairs found for this token. This token may be newly created or not yet listed on any decentralized exchange.'
      };
    }

    // 2. Encontrar el mejor pool automáticamente
    const bestPool = findBestPool(rawData.pools, preferredBaseTokens);
    if (!bestPool) {
      return {
        success: false,
        data: rawData,
        error: 'Insufficient trading data available for this token. This token may be too new or have limited trading activity. Please try again later once more trading pairs are established.'
      };
    }

    console.log(`✅ Pool seleccionado: ${bestPool.id.slice(0, 8)}... (${bestPool.token0.symbol}/${bestPool.token1.symbol})`);
    console.log(`📊 TVL: $${parseFloat(bestPool.totalValueLockedUSD).toFixed(2)}`);
    console.log(`📈 Volumen: $${parseFloat(bestPool.volumeUSD).toFixed(2)}`);

    // 3. Procesar datos según timeframe
    const historicalData = config.entity === 'poolHourData' 
      ? bestPool.poolHourData 
      : bestPool.poolDayData;

    if (!historicalData || historicalData.length === 0) {
      return {
        success: false,
        data: rawData,
        error: 'No historical price data available for the selected time period. This token may be too new or have insufficient trading history to generate a chart.'
      };
    }

    console.log(`📅 Datos históricos: ${historicalData.length} puntos (${config.entity})`);

    const chartData = processTimeframeData(
      historicalData, 
      bestPool, 
      rawData.bundle.ethPriceUSD,
      config,
      tokenAddress
    );

    // 4. Formatear respuesta
    return {
      success: true,
      data: {
        ...rawData,
        timeframe,
        metadata: {
          selectedPool: bestPool.id,
          baseToken: getBaseToken(bestPool, tokenAddress).symbol,
          calculationMethod: 'tokenPrice × baseTokenDerivedETH × ethPriceUSD',
          totalDataPoints: chartData.length,
          dateRange: {
            start: chartData[0]?.time,
            end: chartData[chartData.length - 1]?.time
          },
          poolInfo: {
            tvl: parseFloat(bestPool.totalValueLockedUSD),
            volume: parseFloat(bestPool.volumeUSD),
            token0: bestPool.token0.symbol,
            token1: bestPool.token1.symbol
          }
        }
      },
      chartData
    };

  } catch (error) {
    console.error('❌ Error en getTokenChartData:', error);
    return {
      success: false,
      data: { bundle: { ethPriceUSD: "0" }, pools: [] },
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

// ===== EXPORTAR CONFIGURACIONES =====

export { TIMEFRAMES, type TimeframeConfig, type TokenChartResponse, type FormattedChartData };
