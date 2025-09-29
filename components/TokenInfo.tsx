'use client';

import React, { useState } from 'react';
import { useTokenInfo } from '@/hooks/useTokenInfo';

interface TokenInfoProps {
  tokenAddress?: string;
  priceOnly?: boolean;
  refreshInterval?: number;
  className?: string;
}

export function TokenInfo({ 
  tokenAddress: propTokenAddress,
  priceOnly = false,
  refreshInterval = 30000,
  className = ""
}: TokenInfoProps) {
  const [inputAddress, setInputAddress] = useState(propTokenAddress || '');
  const [activeAddress, setActiveAddress] = useState(propTokenAddress || '');

  const { data, loading, error, refetch, lastUpdated } = useTokenInfo({
    tokenAddress: activeAddress,
    priceOnly,
    refreshInterval,
    enabled: !!activeAddress,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputAddress.trim()) {
      setActiveAddress(inputAddress.trim());
    }
  };

  const formatNumber = (num: number | undefined, decimals = 2) => {
    if (num === undefined || num === null) return 'N/A';
    // Mostrar números exactos sin redondear para precios
    if (decimals === 6) {
      return num.toString();
    }
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formatPercentage = (num: number | undefined) => {
    if (num === undefined || num === null) return 'N/A';
    const formatted = formatNumber(num, 2);
    const sign = num > 0 ? '+' : '';
    const color = num > 0 ? 'text-green-600' : num < 0 ? 'text-red-600' : 'text-gray-600';
    return <span className={color}>{sign}{formatted}%</span>;
  };

  const formatCurrency = (num: number | undefined, prefix = '$') => {
    if (num === undefined || num === null) return 'N/A';
    if (num >= 1e9) return `${prefix}${formatNumber(num / 1e9, 1)}B`;
    if (num >= 1e6) return `${prefix}${formatNumber(num / 1e6, 1)}M`;
    if (num >= 1e3) return `${prefix}${formatNumber(num / 1e3, 1)}K`;
    return `${prefix}${formatNumber(num)}`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Input para dirección del token */}
      {!propTokenAddress && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputAddress}
            onChange={(e) => setInputAddress(e.target.value)}
            placeholder="Ingresa la dirección del token (0x...)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!inputAddress.trim() || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Cargando...' : 'Consultar'}
          </button>
        </form>
      )}

      {/* Botón de refrescar */}
      {activeAddress && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {lastUpdated && `Última actualización: ${new Date(lastUpdated).toLocaleTimeString()}`}
          </div>
          <button
            onClick={refetch}
            disabled={loading}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50"
          >
            🔄 Refrescar
          </button>
        </div>
      )}

      {/* Estado de carga */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Consultando información del token...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error al consultar token</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Información del token */}
      {data && data.success && (
        <div className="space-y-6">
          {/* Información básica del token */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                {/* Logo del token */}
                {data.token.logo && (
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img 
                      src={data.token.logo} 
                      alt={data.token.symbol}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-600" style={{ display: 'none' }}>
                      {data.token.symbol.charAt(0)}
                    </div>
                  </div>
                )}
                
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {data.token.name} ({data.token.symbol})
                  </h2>
                  <p className="text-sm text-gray-500 font-mono">{data.token.address}</p>
                  {data.token.decimals && (
                    <p className="text-sm text-gray-500">Decimales: {data.token.decimals}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Fuente: {data.source}</div>
              </div>
            </div>

            {/* Precio principal */}
            {data.price && (
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Precio USD</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${formatNumber(data.price.usd, 6)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Precio Nativo</p>
                    <p className="text-xl font-semibold">
                      {formatNumber(data.price.native, 8)} {data.price.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cambio 24h</p>
                    <p className="text-xl font-semibold">
                      {data.marketData && formatPercentage(data.marketData.priceChange24h)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Datos de mercado */}
          {data.marketData && !priceOnly && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Datos de Mercado</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Market Cap</p>
                  <p className="text-lg font-semibold">{formatCurrency(data.marketData.marketCap)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">FDV</p>
                  <p className="text-lg font-semibold">{formatCurrency(data.marketData.fdv)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Liquidez</p>
                  <p className="text-lg font-semibold">{formatCurrency(data.marketData.liquidity)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Volumen 24h</p>
                  <p className="text-lg font-semibold">{formatCurrency(data.marketData.volume24h)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Datos de trading */}
          {data.tradingData && !priceOnly && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Actividad de Trading</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Transacciones</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">5 min:</span>
                      <span className="text-sm">
                        {data.tradingData.transactions.m5.buys} compras / {data.tradingData.transactions.m5.sells} ventas
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">1 hora:</span>
                      <span className="text-sm">
                        {data.tradingData.transactions.h1.buys} compras / {data.tradingData.transactions.h1.sells} ventas
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">24 horas:</span>
                      <span className="text-sm">
                        {data.tradingData.transactions.h24.buys} compras / {data.tradingData.transactions.h24.sells} ventas
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Volumen</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">5 min:</span>
                      <span className="text-sm">{formatCurrency(data.tradingData.volume.m5)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">1 hora:</span>
                      <span className="text-sm">{formatCurrency(data.tradingData.volume.h1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">24 horas:</span>
                      <span className="text-sm">{formatCurrency(data.tradingData.volume.h24)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pools disponibles */}
          {data.pools && data.pools.length > 0 && !priceOnly && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Pools de Liquidez ({data.pools.length})</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-sm font-medium text-gray-500">DEX</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-500">Par</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-500">Precio</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-500">Liquidez</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-500">Volumen 24h</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pools.slice(0, 5).map((pool, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 text-sm">
                          <div className="flex items-center">
                            <span className="font-medium">{pool.dex}</span>
                            {pool.version && (
                              <span className="ml-2 px-2 py-1 bg-gray-100 text-xs rounded">
                                {pool.version}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 text-sm">
                          {pool.baseToken}/{pool.quoteToken}
                        </td>
                        <td className="py-2 text-sm text-right">
                          ${formatNumber(pool.priceUsd, 6)}
                        </td>
                        <td className="py-2 text-sm text-right">
                          {formatCurrency(pool.liquidity)}
                        </td>
                        <td className="py-2 text-sm text-right">
                          {formatCurrency(pool.volume24h)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
