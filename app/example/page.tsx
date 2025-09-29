'use client';

import { useState, useEffect } from 'react';
import TimeSeriesChart from '../../components/TimeSeriesChart';
import CandlestickChart from '../../components/CandlestickChart';
import { useTokenChart, useTimeframeSelector } from '../../hooks/use-token-chart';

export default function ExamplePage() {
  const [activeTab, setActiveTab] = useState<'timeseries' | 'candlestick' | 'modular'>('timeseries');
  const [contractAddress, setContractAddress] = useState('0x5fc18a6d9f8dca772a6ccc524c6657d1e647bd7c');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Sistema modular
  const { currentTimeframe, availableTimeframes, setTimeframe } = useTimeframeSelector('1M');
  const { response: modularResponse, loading: modularLoading, error: modularError, refetch: modularRefetch } = useTokenChart(contractAddress, {
    timeframe: currentTimeframe,
    preferredBaseTokens: ['USDC', 'WETH', 'USDT', 'ZORA'],
    network: 'base'
  });
  
  // TimeSeries data
  const [seriesData, setSeriesData] = useState<any[]>([]);
  const [isLoadingSeries, setIsLoadingSeries] = useState(false);
  const [seriesError, setSeriesError] = useState<string | null>(null);
  const [rawSeriesResponse, setRawSeriesResponse] = useState<any>(null);
  const [selectedSeriesPeriod, setSelectedSeriesPeriod] = useState<'1W' | '1M' | '3M' | '1Y' | 'ALL' | 'daily' | 'weekly' | 'monthly'>('1W');
  
  // Candlestick data
  const [apiData, setApiData] = useState<any[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [rawApiResponse, setRawApiResponse] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'1W' | '1M' | '3M' | '1Y' | 'ALL' | 'daily' | 'weekly' | 'monthly'>('1W');
  
  // Función para cargar datos de ejemplo
  const loadExampleData = () => {
    console.log('📊 Cargando datos de ejemplo...');
    
    // Datos de ejemplo para TimeSeries
    const sampleTimeSeriesData = [
      { time: '2018-12-22', value: 32.51, volume: 1000, high: 35.0, low: 30.0, trades: 50, open: 31.0, close: 32.51 },
      { time: '2018-12-23', value: 31.11, volume: 1200, high: 33.0, low: 29.5, trades: 60, open: 32.0, close: 31.11 },
      { time: '2018-12-24', value: 27.02, volume: 800, high: 30.0, low: 25.0, trades: 40, open: 29.0, close: 27.02 },
      { time: '2018-12-25', value: 27.32, volume: 900, high: 29.0, low: 26.0, trades: 45, open: 27.5, close: 27.32 },
      { time: '2018-12-26', value: 25.17, volume: 1100, high: 28.0, low: 24.0, trades: 55, open: 26.0, close: 25.17 },
    ];
    
    // Datos de ejemplo para Candlestick
    const sampleCandlestickData = [
      { time: '2018-12-22', open: 75.16, high: 82.84, low: 36.16, close: 45.72 },
      { time: '2018-12-23', open: 45.12, high: 53.90, low: 45.12, close: 48.09 },
      { time: '2018-12-24', open: 60.71, high: 60.71, low: 53.39, close: 59.29 },
      { time: '2018-12-25', open: 68.26, high: 68.26, low: 59.04, close: 60.50 },
      { time: '2018-12-26', open: 67.71, high: 105.85, low: 66.67, close: 91.04 },
    ];
    
    setSeriesData(sampleTimeSeriesData);
    setApiData(sampleCandlestickData);
    setSeriesError(null);
    setApiError(null);
    setRawSeriesResponse({ success: true, chartData: sampleTimeSeriesData, message: 'Datos de ejemplo cargados' });
    setRawApiResponse({ success: true, chartData: sampleCandlestickData, message: 'Datos de ejemplo cargados' });
    
    console.log('✅ Datos de ejemplo cargados para ambos gráficos');
  };

  // Función para cargar datos de la API
  const loadDataFromAPI = async () => {
    try {
      setIsLoadingSeries(true);
      setIsLoadingApi(true);
      setSeriesError(null);
      setApiError(null);
      setRawSeriesResponse(null);
      setRawApiResponse(null);
      
      console.log('🔍 Obteniendo datos de la API para:', contractAddress);
      
      // Mapear timeframes a parámetros de la API
      const timeframeMap = {
        '1W': '1W',
        '1M': '1M',
        '3M': '3M',
        '1Y': '1Y',
        'ALL': 'ALL',
        'daily': '1W',    // Legacy: daily -> 1W
        'weekly': '1M',   // Legacy: weekly -> 1M  
        'monthly': '3M'   // Legacy: monthly -> 3M
      };
      
      const timeframe = timeframeMap[selectedSeriesPeriod] || '1W';
      
      // Cargar datos para TimeSeries usando el sistema modular
      const seriesResponse = await fetch(`/api/charts/data?contractAddress=${contractAddress}&network=base&timeframe=${timeframe}&chartType=line`);
      const seriesData = await seriesResponse.json();
      
      // Cargar datos para Candlestick usando el sistema modular
      const candlestickResponse = await fetch(`/api/charts/data?contractAddress=${contractAddress}&network=base&timeframe=${timeframe}&chartType=candlestick`);
      const candlestickData = await candlestickResponse.json();
      
      console.log('📊 Respuesta de serie temporal:', seriesData);
      console.log('📊 Respuesta de candlestick:', candlestickData);
      
      setRawSeriesResponse(seriesData);
      setRawApiResponse(candlestickData);
      
      // Procesar datos de TimeSeries
      if (seriesData.success && seriesData.chartData && seriesData.chartData.length > 0) {
        const rawSeriesData = seriesData.chartData.map((point: any) => ({
          time: point.time,
          value: point.value,
          volume: point.volume,
          high: point.high,
          low: point.low,
          trades: point.trades,
          open: point.open,
          close: point.close
        }));
        setSeriesData(rawSeriesData);
      } else {
        setSeriesError('No hay datos disponibles para este token');
      }
      
      // Procesar datos de Candlestick
      if (candlestickData.success && candlestickData.chartData && candlestickData.chartData.length > 0) {
        const rawCandlestickData = candlestickData.chartData.map((point: any) => ({
          time: point.time,
          open: point.open,
          high: point.high,
          low: point.low,
          close: point.close,
        }));
        setApiData(rawCandlestickData);
      } else {
        setApiError('No hay datos disponibles para este token');
      }
      
    } catch (err) {
      console.error('❌ Error obteniendo datos:', err);
      setSeriesError(err instanceof Error ? err.message : 'Error desconocido');
      setApiError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoadingSeries(false);
      setIsLoadingApi(false);
    }
  };


  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📊 Charts Example
            </h1>
            <p className="text-gray-600">
              TimeSeries y Candlestick Charts con datos de API
            </p>
          </div>
          <div className="text-center py-8">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 Charts Example
          </h1>
          <p className="text-gray-600">
            TimeSeries y Candlestick Charts con datos de API
          </p>
        </div>

        {/* Contract Address Input */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
            🔗 Contract Address
            </h2>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección del contrato:
              </label>
              <input
                type="text"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={loadDataFromAPI}
                disabled={isLoadingSeries || isLoadingApi}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingSeries || isLoadingApi ? 'Loading...' : 'Load Data API'}
              </button>
              <button
                onClick={loadExampleData}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Load Example
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex space-x-1 mb-6">
            <button
              onClick={() => setActiveTab('timeseries')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'timeseries'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📈 Time Series
            </button>
            <button
              onClick={() => setActiveTab('candlestick')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'candlestick'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🕯️ Candlestick
            </button>
            <button
              onClick={() => setActiveTab('modular')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'modular'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🚀 Sistema Modular
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'timeseries' && (
            <>
              {seriesData.length > 0 ? (
          <TimeSeriesChart
            data={seriesData}
            contractAddress={contractAddress}
            selectedPeriod={selectedSeriesPeriod}
                  onPeriodChange={(period) => {
                    setSelectedSeriesPeriod(period);
                    // Recargar automáticamente al cambiar el período
                    setTimeout(() => loadDataFromAPI(), 100);
                  }}
                  onFetchData={() => loadDataFromAPI()}
            isLoading={isLoadingSeries}
            error={seriesError}
            rawResponse={rawSeriesResponse}
            height={400}
          />
              ) : (
                <div className="text-center py-8">
                  <div className="text-sm text-gray-500">
                    {isLoadingSeries ? 'Loading chart data...' : 
                     seriesError ? seriesError : 
                     'No chart data available for this token.'}
                  </div>
        </div>
              )}
            </>
          )}

          {activeTab === 'candlestick' && (
            <>
              {apiData.length > 0 ? (
          <CandlestickChart
            data={apiData}
            contractAddress={contractAddress}
            selectedPeriod={selectedPeriod}
                  onPeriodChange={(period) => {
                    setSelectedPeriod(period);
                    // Recargar automáticamente al cambiar el período
                    setTimeout(() => loadDataFromAPI(), 100);
                  }}
                  onFetchData={() => loadDataFromAPI()}
            isLoading={isLoadingApi}
            error={apiError}
            rawResponse={rawApiResponse}
            height={400}
          />
              ) : (
                <div className="text-center py-8">
                  <div className="text-sm text-gray-500">
                    {isLoadingApi ? 'Loading chart data...' : 
                     apiError ? apiError : 
                     'No chart data available for this token.'}
                  </div>
        </div>
              )}
            </>
          )}

          {activeTab === 'modular' && (
            <div className="space-y-6">
              {/* Selector de timeframe para el sistema modular */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  🎯 Sistema Modular - Timeframes
          </h3>
                <div className="flex flex-wrap gap-2">
                  {availableTimeframes.map((timeframe) => (
                    <button
                      key={timeframe}
                      onClick={() => setTimeframe(timeframe)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        currentTimeframe === timeframe
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {timeframe}
                    </button>
                  ))}
            </div>
                <div className="mt-3 text-sm text-gray-600">
                  <p><strong>Timeframe actual:</strong> {currentTimeframe}</p>
                  <p><strong>Estado:</strong> {modularLoading ? 'Cargando...' : modularError ? 'Error' : 'Listo'}</p>
                  {modularResponse?.data?.metadata && (
                    <p><strong>Pool:</strong> {modularResponse.data.metadata.selectedPool?.slice(0, 8)}...</p>
                  )}
          </div>
        </div>

              {/* Componente modular - Eliminado */}
              <div className="text-center text-gray-500 py-8">
                <p>Componente modular eliminado - usar TimeSeriesChart o CandlestickChart</p>
              </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
