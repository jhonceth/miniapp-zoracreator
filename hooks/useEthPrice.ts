import { useState, useEffect } from 'react';

interface EthPriceData {
  price: number;
  source: string;
  timestamp: string;
}

export function useEthPrice() {
  const [ethPrice, setEthPrice] = useState<EthPriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEthPrice = async () => {
    try {
      const response = await fetch('/api/price/eth');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setEthPrice(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching ETH price:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch ETH price');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch immediately
    fetchEthPrice();
    
    // Then fetch every 20 seconds
    const interval = setInterval(fetchEthPrice, 20000);
    
    return () => clearInterval(interval);
  }, []);

  return { ethPrice, loading, error, refetch: fetchEthPrice };
}
