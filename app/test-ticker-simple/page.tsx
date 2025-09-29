'use client';

// SimplePriceTicker component removed
import { useEthPrice } from '@/hooks/useEthPrice';
import { useTokenInfo } from '@/hooks/useTokenInfo';

export default function TestTickerPage() {
  const { ethPrice, loading: ethLoading, error: ethError } = useEthPrice();
  const { data: zoraInfo, loading: zoraLoading, error: zoraError } = useTokenInfo({
    tokenAddress: '0x1111111111166b7FE7bd91427724B487980aFc69',
    priceOnly: true,
    refreshInterval: 20000,
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center">Test del Ticker de Precios</h1>
        
        {/* Debug info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Info</h2>
          <div className="space-y-2">
            <div>
              <h3 className="font-semibold">ETH:</h3>
              <p><strong>Loading:</strong> {ethLoading ? 'Sí' : 'No'}</p>
              <p><strong>Error:</strong> {ethError || 'Ninguno'}</p>
              <p><strong>Data:</strong> {JSON.stringify(ethPrice, null, 2)}</p>
            </div>
            <div>
              <h3 className="font-semibold">ZORA:</h3>
              <p><strong>Loading:</strong> {zoraLoading ? 'Sí' : 'No'}</p>
              <p><strong>Error:</strong> {zoraError || 'Ninguno'}</p>
              <p><strong>Data:</strong> {JSON.stringify(zoraInfo, null, 2)}</p>
            </div>
          </div>
        </div>

        {/* Ticker */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Ticker Simplificado</h2>
          <div className="text-center text-gray-500 py-8">
            <p>SimplePriceTicker component removed</p>
          </div>
        </div>

        {/* Test de APIs directas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test APIs Directas</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">ETH API:</h3>
              <button 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/price/eth');
                    const data = await response.json();
                    console.log('ETH API Response:', data);
                    alert(`ETH: $${data.price} (${data.source})`);
                  } catch (error) {
                    console.error('ETH API Error:', error);
                    alert('Error en ETH API');
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Test ETH API
              </button>
            </div>
            <div>
              <h3 className="font-semibold">ZORA API:</h3>
              <button 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/token-info?address=0x1111111111166b7FE7bd91427724B487980aFc69&price=true');
                    const data = await response.json();
                    console.log('ZORA API Response:', data);
                    alert(`ZORA: $${data.price?.usd} (${data.source})`);
                  } catch (error) {
                    console.error('ZORA API Error:', error);
                    alert('Error en ZORA API');
                  }
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Test ZORA API
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
