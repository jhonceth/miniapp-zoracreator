'use client';

// PriceTicker component removed
import { useEthPrice } from '@/hooks/useEthPrice';

export default function TestTickerPage() {
  const { ethPrice, loading, error } = useEthPrice();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center">Test del Ticker de Precios</h1>
        
        {/* Debug info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Info</h2>
          <div className="space-y-2">
            <p><strong>ETH Loading:</strong> {loading ? 'Sí' : 'No'}</p>
            <p><strong>ETH Error:</strong> {error || 'Ninguno'}</p>
            <p><strong>ETH Data:</strong> {JSON.stringify(ethPrice, null, 2)}</p>
          </div>
        </div>

        {/* Ticker */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Ticker</h2>
          <div className="text-center text-gray-500 py-8">
            <p>PriceTicker component removed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
