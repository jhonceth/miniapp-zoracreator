'use client';

import { useEthPrice } from '@/hooks/useEthPrice';

export function EthPriceDisplay() {
  const { ethPrice, loading, error } = useEthPrice();

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        <span>Loading ETH price...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-500">
        <span>⚠️</span>
        <span>ETH price unavailable</span>
      </div>
    );
  }

  if (!ethPrice) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex items-center gap-1">
        <span className="text-blue-600 font-semibold">ETH</span>
        <span className="text-gray-700">${ethPrice.price.toFixed(2)}</span>
      </div>
      <div className="text-xs text-gray-500">
        via {ethPrice.source}
      </div>
    </div>
  );
}
