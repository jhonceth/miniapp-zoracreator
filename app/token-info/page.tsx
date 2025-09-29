'use client';

import { TokenInfo } from '@/components/TokenInfo';

export default function TokenInfoPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Consulta de Información de Tokens
          </h1>
          <p className="text-gray-600">
            Obtén precios, datos de mercado y información de trading en tiempo real
          </p>
        </div>

        {/* Ejemplo con ZORA */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Ejemplo: Token ZORA (Información completa)
          </h2>
          <TokenInfo 
            tokenAddress="0x1111111111166b7FE7bd91427724B487980aFc69"
            refreshInterval={30000}
          />
        </div>

        {/* Ejemplo solo precio */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Ejemplo: Solo precio de ZORA
          </h2>
          <TokenInfo 
            tokenAddress="0x1111111111166b7FE7bd91427724B487980aFc69"
            priceOnly={true}
            refreshInterval={10000}
          />
        </div>

        {/* Consulta manual */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Consulta Manual
          </h2>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <p className="text-gray-600 mb-4">
              Ingresa cualquier dirección de token para obtener su información:
            </p>
            <TokenInfo refreshInterval={30000} />
          </div>
        </div>

        {/* Información de uso */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Cómo usar
          </h3>
          <div className="space-y-2 text-blue-800 text-sm">
            <p><strong>API Principal:</strong> DexScreener - Proporciona precios, volumen, liquidez y datos de trading</p>
            <p><strong>API Fallback:</strong> Blockscout - Proporciona información básica del token si DexScreener falla</p>
            <p><strong>Parámetros:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• <code>?address=0x...</code> - Dirección del token (requerido)</li>
              <li>• <code>&price=true</code> - Devolver solo información de precio</li>
            </ul>
            <p><strong>Actualización automática:</strong> Los datos se actualizan cada 30 segundos por defecto</p>
          </div>
        </div>
      </div>
    </div>
  );
}
