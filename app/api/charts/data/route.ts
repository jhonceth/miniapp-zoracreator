// 🎯 API MODULAR CON SISTEMA DE BÚSQUEDAS EN POOLS
// Implementación completa con múltiples timeframes y agregaciones

import { NextRequest, NextResponse } from 'next/server';
import { getTokenChartData } from '@/lib/graphql-modular';
import { env } from '@/lib/env';
import { getCache, setCache } from '@/lib/redisCache';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contractAddress = searchParams.get('contractAddress');
    const timeframe = searchParams.get('timeframe') || '1M';
    const network = searchParams.get('network') || 'base';
    const chartType = searchParams.get('chartType') || 'line';
    const preferredBaseTokens = searchParams.get('preferredBaseTokens')?.split(',') || ['ZORA', 'WETH', 'USDC', 'USDT'];

    console.log('🚀 Charts API called with:', { 
      contractAddress, 
      timeframe, 
      network, 
      chartType,
      preferredBaseTokens 
    });

    if (!contractAddress) {
      console.log('❌ Missing contractAddress parameter');
      return NextResponse.json(
        { error: 'contractAddress es requerido' },
        { status: 400 }
      );
    }

    console.log('🔍 Consultando The Graph con sistema modular:', { 
      contractAddress, 
      timeframe, 
      network, 
      chartType,
      preferredBaseTokens 
    });

    // Generar clave de caché única con fecha actual para evitar datos obsoletos
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const cacheKey = `chart:${contractAddress}:${timeframe}:${network}:${preferredBaseTokens.join(',')}:${today}`;
    
    // Intentar obtener datos del caché primero
    console.log('🔍 Checking cache for key:', cacheKey);
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      console.log('✅ Datos obtenidos del caché:', cacheKey);
      console.log('📊 Cached data sample:', cachedData.chartData?.slice(0, 3));
      return NextResponse.json({
        ...cachedData,
        cached: true,
        cacheKey
      });
    }

    try {
      console.log('🌐 Fetching fresh data from The Graph...');
      // Usar el sistema modular
      const result = await getTokenChartData(
        contractAddress,
        timeframe,
        preferredBaseTokens,
        network,
        env.THEGRAPH_API_KEY || undefined
      );

      console.log('📡 The Graph result:', {
        success: result.success,
        dataLength: result.chartData?.length || 0,
        error: result.error
      });

      if (!result.success) {
        console.log('❌ The Graph API failed:', result.error);
        return NextResponse.json({
          success: false,
          error: result.error,
          data: result.data
        }, { status: 400 });
      }

      console.log(`✅ Datos obtenidos exitosamente: ${result.chartData?.length || 0} puntos`);
      console.log('📊 Sample chart data:', result.chartData?.slice(0, 3));

      const responseData = {
        success: true,
        data: result.data,
        chartData: result.chartData,
        timeframe,
        chartPointsCount: result.chartData?.length || 0,
        message: 'Datos obtenidos exitosamente con sistema modular',
        cached: false,
        cacheKey
      };

      // Guardar en caché hasta el final del día (expira a medianoche)
      const now = new Date();
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      const ttlSeconds = Math.floor((endOfDay.getTime() - now.getTime()) / 1000);
      
      await setCache(cacheKey, responseData, ttlSeconds);
      console.log(`💾 Datos guardados en caché hasta medianoche (${ttlSeconds}s):`, cacheKey);

      return NextResponse.json(responseData);

    } catch (fetchError) {
      console.error('❌ Error en fetch a The Graph:', fetchError);
      
      return NextResponse.json({
        success: false,
        error: `Error de conexión: ${fetchError instanceof Error ? fetchError.message : 'Error desconocido'}`,
        data: { bundle: { ethPriceUSD: "0" }, pools: [] }
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error en API de gráficos:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Error desconocido',
        success: false 
      },
      { status: 500 }
    );
  }
}